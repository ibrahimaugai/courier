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
        status: true,
      },
      orderBy: {
        serviceName: 'asc',
      },
    });
  }

  async createPricingRule(data: { originCityId: string; destinationCityId: string; serviceId: string; weightFrom: number; weightTo: number; baseRate: number }) {
    // 1. Create the primary rule
    const rule = await this.prisma.pricingRule.create({
      data: {
        ...data,
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

  async createService(data: { serviceName: string; serviceType: string; serviceCode?: string }) {
    const serviceCode = data.serviceCode || data.serviceName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 100);
    return await this.prisma.service.create({
      data: {
        ...data,
        serviceCode,
      },
    });
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
