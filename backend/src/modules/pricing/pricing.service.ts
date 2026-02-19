import { BadRequestException, Injectable } from '@nestjs/common';
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
    const categoryMapping: { [key: string]: string[] } = {
      'ATS - Doc MOFA Attestation': ['ATS'],
      'ATR - Doc MOFA Home Delivery': ['ATR'],
      'APN - Apostille Normal': ['APN'],
      'APU - Apostille Urgent': ['APU'],
      'AE - UAE Embassy': ['AE'],
      'BV - Board Verification': ['BV'],
      'HEC - HEC': ['HEC'],
      'IBCC - IBCC': ['IBCC'],
      'National Bureau': ['NationalBureau'],
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
          if (categoryLower === 'ats') return serviceNameLower.includes('mofa') && (serviceNameLower.includes('doc') || serviceNameLower.includes('attestation'));
          if (categoryLower === 'atr') return serviceNameLower.includes('mofa') && serviceNameLower.includes('home delivery');
          if (categoryLower === 'apn') return serviceNameLower.includes('apostille') && serviceNameLower.includes('normal');
          if (categoryLower === 'apu') return serviceNameLower.includes('apostille') && (serviceNameLower.includes('urgent') || serviceNameLower.includes('urgnt'));
          if (categoryLower === 'ae') return serviceNameLower.includes('uae') && serviceNameLower.includes('embassy');
          if (categoryLower === 'bv') return serviceNameLower.includes('board') && serviceNameLower.includes('verification');
          if (categoryLower === 'hec') return serviceNameLower.includes('hec');
          if (categoryLower === 'ibcc') return serviceNameLower.includes('ibcc');
          if (categoryLower === 'nationalbureau') return serviceNameLower.includes('national bureau') || serviceNameLower.includes('national beuro');
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
    if (!service) throw new BadRequestException('Service not found.');

    const bookingCount = await this.prisma.booking.count({ where: { serviceId: id } });
    if (bookingCount > 0) {
      throw new BadRequestException(`Cannot delete: ${bookingCount} booking(s) use this service.`);
    }
    const productCount = await this.prisma.product.count({ where: { serviceId: id } });
    if (productCount > 0) {
      throw new BadRequestException(`Cannot delete: ${productCount} product(s) use this service.`);
    }

    await this.prisma.pricingRule.deleteMany({ where: { serviceId: id } });
    return await this.prisma.service.delete({ where: { id } });
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
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new BadRequestException('City not found.');

    const [rulesCount, bookingsCount, stationsCount, customersCount] = await Promise.all([
      this.prisma.pricingRule.count({ where: { OR: [{ originCityId: id }, { destinationCityId: id }] } }),
      this.prisma.booking.count({ where: { OR: [{ originCityId: id }, { destinationCityId: id }] } }),
      this.prisma.station.count({ where: { cityId: id } }),
      this.prisma.customer.count({ where: { cityId: id } }),
    ]);
    if (rulesCount > 0 || bookingsCount > 0 || stationsCount > 0 || customersCount > 0) {
      const parts = [];
      if (rulesCount) parts.push(`${rulesCount} pricing rule(s)`);
      if (bookingsCount) parts.push(`${bookingsCount} booking(s)`);
      if (stationsCount) parts.push(`${stationsCount} station(s)`);
      if (customersCount) parts.push(`${customersCount} customer(s)`);
      throw new BadRequestException(`Cannot delete: city is used by ${parts.join(', ')}.`);
    }

    return await this.prisma.city.delete({ where: { id } });
  }

  async getAttestationCategories(): Promise<{ key: string; display: string }[]> {
    const defaultCats = [
      { key: 'ATS', display: 'ATS - Doc MOFA Attestation' },
      { key: 'ATR', display: 'ATR - Doc MOFA Home Delivery' },
      { key: 'APN', display: 'APN - Apostille Normal' },
      { key: 'APU', display: 'APU - Apostille Urgent' },
      { key: 'AE', display: 'AE - UAE Embassy' },
      { key: 'BV', display: 'BV - Board Verification' },
      { key: 'HEC', display: 'HEC - HEC' },
      { key: 'IBCC', display: 'IBCC - IBCC' },
      { key: 'NationalBureau', display: 'National Bureau' },
    ];
    const defaultKeys = new Set(defaultCats.map((c) => c.key.toLowerCase()));
    const fromDb = await this.prisma.service.findMany({
      where: { serviceType: 'Attestation', attestationCategory: { not: null } },
      select: { attestationCategory: true },
      distinct: ['attestationCategory'],
    });
    const dynamic: { key: string; display: string }[] = [];
    fromDb.forEach((s) => {
      const k = (s.attestationCategory || '').trim();
      if (k && !defaultKeys.has(k.toLowerCase())) {
        defaultKeys.add(k.toLowerCase());
        dynamic.push({ key: k, display: k });
      }
    });
    return [...defaultCats, ...dynamic];
  }

  private serviceBelongsToCategory(service: { attestationCategory?: string | null; serviceName: string }, categoryKey: string): boolean {
    const cat = (service.attestationCategory || '').trim();
    if (cat && cat.toLowerCase() === categoryKey.toLowerCase()) return true;
    const name = (service.serviceName || '').toLowerCase();
    const key = categoryKey.toLowerCase();
    if (key === 'ats') return name.includes('mofa') && (name.includes('doc') || name.includes('attestation'));
    if (key === 'atr') return name.includes('mofa') && name.includes('home delivery');
    if (key === 'apn') return name.includes('apostille') && name.includes('normal');
    if (key === 'apu') return name.includes('apostille') && (name.includes('urgent') || name.includes('urgnt'));
    if (key === 'ae') return name.includes('uae') && name.includes('embassy');
    if (key === 'bv') return name.includes('board') && name.includes('verification');
    if (key === 'hec') return name.includes('hec');
    if (key === 'ibcc') return name.includes('ibcc');
    if (key === 'nationalbureau') return name.includes('national bureau') || name.includes('national beuro');
    return false;
  }

  async deleteAttestationCategory(categoryKey: string): Promise<{ deleted: number }> {
    const allAttestation = await this.prisma.service.findMany({
      where: { serviceType: 'Attestation' },
      select: { id: true, attestationCategory: true, serviceName: true },
    });
    const services = allAttestation.filter((s) => this.serviceBelongsToCategory(s, categoryKey));
    if (services.length === 0) {
      return { deleted: 0 };
    }
    const ids = services.map((s) => s.id);
    const bookingCount = await this.prisma.booking.count({ where: { serviceId: { in: ids } } });
    if (bookingCount > 0) {
      throw new BadRequestException(
        `Cannot delete category: ${bookingCount} booking(s) use services in this category.`,
      );
    }
    const productRefs = await this.prisma.product.count({ where: { serviceId: { in: ids } } });
    if (productRefs > 0) {
      throw new BadRequestException(`Cannot delete category: ${productRefs} product(s) reference services in this category.`);
    }
    await this.prisma.pricingRule.deleteMany({ where: { serviceId: { in: ids } } });
    await this.prisma.service.deleteMany({ where: { id: { in: ids } } });
    return { deleted: ids.length };
  }
}
