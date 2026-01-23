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
          },
        },
        destinationCity: {
          select: {
            id: true,
            cityCode: true,
            cityName: true,
          },
        },
        service: {
          select: {
            id: true,
            serviceCode: true,
            serviceName: true,
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
          },
        },
        destinationCity: {
          select: {
            id: true,
            cityCode: true,
            cityName: true,
          },
        },
        service: {
          select: {
            id: true,
            serviceCode: true,
            serviceName: true,
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
      where: {
        status: 'active',
      },
      select: {
        id: true,
        cityCode: true,
        cityName: true,
      },
      orderBy: {
        cityName: 'asc',
      },
    });
  }

  async getServices() {
    return await this.prisma.service.findMany({
      where: {
        status: 'active',
      },
      select: {
        id: true,
        serviceCode: true,
        serviceName: true,
      },
      orderBy: {
        serviceName: 'asc',
      },
    });
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
}
