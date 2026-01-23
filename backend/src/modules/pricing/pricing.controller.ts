import { Controller, Get, Query, UseGuards, Patch, Param, Body } from '@nestjs/common';
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
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
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
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all cities' })
  async getCities() {
    return await this.pricingService.getCities();
  }

  @Get('services')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all services' })
  async getServices() {
    return await this.pricingService.getServices();
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
}
