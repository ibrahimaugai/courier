import { Controller, Get, Query, UseGuards, Patch, Param, Body, Post, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Pricing')
@Controller('pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PricingController {
  constructor(private readonly pricingService: PricingService) { }

  @Get('rules')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get all pricing rules' })
  @ApiQuery({ name: 'originCityId', required: false, description: 'Filter by origin city ID' })
  @ApiQuery({ name: 'destinationCityId', required: false, description: 'Filter by destination city ID' })
  async getPricingRules(
    @Query('originCityId') originCityId?: string,
    @Query('destinationCityId') destinationCityId?: string,
  ) {
    if (originCityId || destinationCityId) {
      return await this.pricingService.getPricingRulesByRoute(originCityId, destinationCityId);
    }
    return await this.pricingService.getAllPricingRules();
  }

  @Get('cities')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get all cities' })
  async getCities() {
    return await this.pricingService.getCities();
  }

  @Get('services')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get all services' })
  async getServices() {
    return await this.pricingService.getServices();
  }

  @Get('subservices')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get subservices for a given service category' })
  @ApiQuery({ name: 'serviceName', required: true, description: 'Service category name (e.g., NPS All Services)' })
  async getSubservices(@Query('serviceName') serviceName: string) {
    if (!serviceName) {
      return [];
    }
    try {
      return await this.pricingService.getSubservices(serviceName);
    } catch (error) {
      console.error('Error fetching subservices:', error);
      return [];
    }
  }

  @Patch('rules/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a pricing rule (with symmetry)' })
  async updatePricingRule(
    @Param('id') id: string,
    @Body() updateData: { baseRate?: number; ratePerKg?: number; additionalCharges?: number; status?: string }
  ) {
    return await this.pricingService.updatePricingRule(id, updateData);
  }

  @Post('rules')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new pricing rule (with symmetry)' })
  async createPricingRule(
    @Body() data: { originCityId: string; destinationCityId: string; serviceId: string; weightFrom: number; weightTo: number; baseRate: number }
  ) {
    return await this.pricingService.createPricingRule(data);
  }

  // ============================================
  // SERVICE MANAGEMENT
  // ============================================

  @Post('services')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new service' })
  async createService(@Body() data: { serviceName: string; serviceType: string; serviceCode?: string }) {
    return await this.pricingService.createService(data);
  }

  @Patch('services/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a service' })
  async updateService(
    @Param('id') id: string,
    @Body() data: { serviceName?: string; serviceType?: string; status?: string }
  ) {
    return await this.pricingService.updateService(id, data);
  }

  @Delete('services/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete or deactivate a service' })
  async deleteService(@Param('id') id: string) {
    return await this.pricingService.deleteService(id);
  }

  // ============================================
  // CITY MANAGEMENT
  // ============================================

  @Post('cities')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new city' })
  async createCity(@Body() data: { cityName: string; cityCode: string }) {
    return await this.pricingService.createCity(data);
  }

  @Patch('cities/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a city' })
  async updateCity(
    @Param('id') id: string,
    @Body() data: { cityName?: string; cityCode?: string; status?: string }
  ) {
    return await this.pricingService.updateCity(id, data);
  }

  @Delete('cities/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete or deactivate a city' })
  async deleteCity(@Param('id') id: string) {
    return await this.pricingService.deleteCity(id);
  }
}
