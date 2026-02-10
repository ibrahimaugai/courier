import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) { }

  async getAllPricingRules() {
    const pricingRules = await this.prisma.pricingRule.findMany({
      include: {
        originCity: {
          select: {
            id: true,
            cityCode: true,
            cityName: true,
            status: true,
          },
        },
        destinationCity: {
          select: {
            id: true,
            cityCode: true,
            cityName: true,
            status: true,
          },
        },
        service: {
          select: {
            id: true,
            serviceCode: true,
            serviceName: true,
            serviceType: true,
            status: true,
          },
        },
      },
      orderBy: [
        { originCity: { cityName: 'asc' } },
        { destinationCity: { cityName: 'asc' } },
        { service: { serviceName: 'asc' } },
        { weightFrom: 'asc' },
      ],
    });

    return pricingRules;
  }

  async getPricingRulesByRoute(originCityId?: string, destinationCityId?: string) {
    const where: any = {};

    if (originCityId) {
      where.originCityId = originCityId;
    }

    if (destinationCityId) {
      where.destinationCityId = destinationCityId;
    }

    const pricingRules = await this.prisma.pricingRule.findMany({
      where,
      include: {
        originCity: {
          select: {
            id: true,
            cityCode: true,
            cityName: true,
            status: true,
          },
        },
        destinationCity: {
          select: {
            id: true,
            cityCode: true,
            cityName: true,
            status: true,
          },
        },
        service: {
          select: {
            id: true,
            serviceCode: true,
            serviceName: true,
            serviceType: true,
            status: true,
          },
        },
      },
      orderBy: [
        { service: { serviceName: 'asc' } },
        { weightFrom: 'asc' },
      ],
    });

    return pricingRules;
  }

  async getCities() {
    return await this.prisma.city.findMany({
      select: {
        id: true,
        cityCode: true,
        cityName: true,
        province: true,
        status: true,
      },
      orderBy: {
        cityName: 'asc',
      },
    });
  }

  async getServices() {
    return await this.prisma.service.findMany({
      select: {
        id: true,
        serviceCode: true,
        serviceName: true,
        serviceType: true,
        days: true,
        attestationCategory: true,
        status: true,
      } as any,
      orderBy: {
        serviceName: 'asc',
      },
    });
  }

  async getSubservices(serviceName: string) {
    // Map service category names to actual service categories in database
    const categoryMapping: { [key: string]: string[] } = {
      'NPS All Services': ['NPS'],
      'Embassies Attestation': ['Embassy'],
      'Educational Documents Attestation': ['Educational'],
      'Special Documents': ['Special'],
      'Translation of any embassy': ['Translation'],
    };

    const categories = categoryMapping[serviceName] || [];
    
    if (categories.length === 0) {
      return [];
    }

    // Get all attestation services and filter by category
    const allServices = await this.prisma.service.findMany({
      where: {
        serviceType: 'Attestation',
        status: 'active',
      },
      include: {
        pricingRules: {
          where: {
            status: 'active',
          },
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        serviceName: 'asc',
      },
    });

    // Prefer attestationCategory when set; fall back to name patterns for backward compatibility
    type ServiceWithCategory = { attestationCategory?: string | null; serviceName: string };
    const subservices = allServices
      .filter((service) => {
        const svc = service as ServiceWithCategory;
        if (svc.attestationCategory) {
          return categories.some(
            (cat) => cat.toLowerCase() === svc.attestationCategory?.toLowerCase()
          );
        }
        const serviceNameLower = service.serviceName.toLowerCase();
        return categories.some((category) => {
          const categoryLower = category.toLowerCase();
          if (categoryLower === 'nps') {
            return (
              serviceNameLower.includes('mofa general') ||
              serviceNameLower.includes('apostille') ||
              serviceNameLower.includes('national beuro') ||
              serviceNameLower.includes('national bureau')
            );
          } else if (categoryLower === 'embassy') {
            return (
              serviceNameLower.includes('embassy') ||
              serviceNameLower.includes('culture')
            );
          } else if (categoryLower === 'educational') {
            return (
              serviceNameLower.includes('hec') ||
              serviceNameLower.includes('university') ||
              serviceNameLower.includes('ibcc') ||
              serviceNameLower.includes('board') ||
              serviceNameLower.includes('borad') ||
              serviceNameLower.includes('enquivalence')
            );
          } else if (categoryLower === 'special') {
            return (
              serviceNameLower.includes('marriage') ||
              serviceNameLower.includes('divorce') ||
              serviceNameLower.includes('stamp paper') ||
              serviceNameLower.includes('commercial documents')
            );
          } else if (categoryLower === 'translation') {
            return serviceNameLower.includes('translation');
          }
          return false;
        });
      })
      .map((service) => {
        const pricingRule = service.pricingRules[0];
        return {
          id: service.id,
          name: service.serviceName,
          price: pricingRule ? parseFloat(pricingRule.baseRate.toString()) : 0,
          days: service.days,
          additionalCharges: pricingRule?.additionalCharges
            ? parseFloat(pricingRule.additionalCharges.toString())
            : null,
        };
      });

    return subservices;
  }

  async createPricingRule(data: { originCityId: string; destinationCityId: string; serviceId: string; weightFrom: number; weightTo: number; baseRate: number }) {
    // 1. Create the primary rule
    const rule = await this.prisma.pricingRule.create({
      data: {
        originCityId: data.originCityId,
        destinationCityId: data.destinationCityId,
        serviceId: data.serviceId,
        weightFrom: data.weightFrom,
        weightTo: data.weightTo,
        baseRate: data.baseRate,
        ratePerKg: 0,
        effectiveFrom: new Date(),
        status: 'active',
      },
    });

    // 2. Handle Symmetry: Create the reverse route rule if it's not a self-to-self route
    if (data.originCityId !== data.destinationCityId) {
      // Check if reverse rule already exists
      const existingReverse = await this.prisma.pricingRule.findFirst({
        where: {
          originCityId: data.destinationCityId,
          destinationCityId: data.originCityId,
          serviceId: data.serviceId,
          weightFrom: data.weightFrom,
          weightTo: data.weightTo,
        },
      });

      if (!existingReverse) {
        await this.prisma.pricingRule.create({
          data: {
            originCityId: data.destinationCityId,
            destinationCityId: data.originCityId,
            serviceId: data.serviceId,
            weightFrom: data.weightFrom,
            weightTo: data.weightTo,
            baseRate: data.baseRate,
            ratePerKg: 0,
            effectiveFrom: new Date(),
            status: 'active',
          },
        });
      }
    }

    return rule;
  }

  async updatePricingRule(id: string, data: any) {
    // 1. Find the rule being updated
    const rule = await this.prisma.pricingRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new Error('Pricing rule not found');
    }

    // 2. Perform the update on the target rule
    const updatedRule = await this.prisma.pricingRule.update({
      where: { id },
      data,
    });

    // 3. Handle Symmetry: Update the reverse route if it's not a self-to-self route
    if (rule.originCityId !== rule.destinationCityId) {
      await this.prisma.pricingRule.updateMany({
        where: {
          originCityId: rule.destinationCityId,
          destinationCityId: rule.originCityId,
          serviceId: rule.serviceId,
          weightFrom: rule.weightFrom,
          weightTo: rule.weightTo,
        },
        data,
      });
    }

    return updatedRule;
  }

  // ============================================
  // SERVICE MANAGEMENT
  // ============================================

  async createService(data: {
    serviceName: string;
    serviceType: string;
    serviceCode?: string;
    days?: string;
    attestationCategory?: string;
    baseRate?: number;
    additionalCharges?: number;
  }) {
    const { baseRate, additionalCharges, ...rest } = data;
    const serviceCode =
      data.serviceCode ||
      (data.serviceType === 'Attestation' && data.attestationCategory
        ? `ATT-${data.attestationCategory.substring(0, 3).toUpperCase()}-${Date.now().toString(36)}`
        : data.serviceName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 100));
    const service = await this.prisma.service.create({
      data: {
        ...rest,
        serviceCode,
        days: data.days ?? undefined,
        attestationCategory: data.attestationCategory ?? undefined,
      } as any,
    });
    // For Attestation subservices: create default pricing rule (0–999 kg, one city) when baseRate provided
    if (
      data.serviceType === 'Attestation' &&
      (data.baseRate !== undefined || data.baseRate === 0)
    ) {
      const defaultCity = await this.prisma.city.findFirst({
        where: { status: 'active' },
        select: { id: true },
      });
      if (defaultCity) {
        await this.prisma.pricingRule.create({
          data: {
            originCityId: defaultCity.id,
            destinationCityId: defaultCity.id,
            serviceId: service.id,
            weightFrom: 0,
            weightTo: 999,
            ratePerKg: 0,
            baseRate: data.baseRate ?? 0,
            additionalCharges: data.additionalCharges ?? null,
            status: 'active',
            effectiveFrom: new Date(),
          },
        });
      }
    }
    return service;
  }

  async updateService(id: string, data: any) {
    return await this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async deleteService(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (service.status === 'active') {
      return await this.prisma.service.update({
        where: { id },
        data: { status: 'inactive' },
      });
    } else {
      return await this.prisma.service.delete({
        where: { id },
      });
    }
  }

  // ============================================
  // CITY MANAGEMENT
  // ============================================

  async createCity(data: { cityName: string; cityCode: string }) {
    return await this.prisma.city.create({
      data,
    });
  }

  async updateCity(id: string, data: any) {
    return await this.prisma.city.update({
      where: { id },
      data,
    });
  }

  async deleteCity(id: string) {
    const city = await this.prisma.city.findUnique({
      where: { id },
    });

    if (city.status === 'active') {
      return await this.prisma.city.update({
        where: { id },
        data: { status: 'inactive' },
      });
    } else {
      return await this.prisma.city.delete({
        where: { id },
      });
    }
  }
}
