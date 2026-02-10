import { Controller, Post, Get, Body, Query, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PickupsService } from './pickups.service';
import { CreatePickupDto } from './dto/create-pickup.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PickupStatus } from '@prisma/client';

@ApiTags('Pickups')
@Controller('pickups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PickupsController {
    constructor(private readonly pickupsService: PickupsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new pickup request' })
    async create(@Body() createPickupDto: CreatePickupDto, @Request() req) {
        return this.pickupsService.create(createPickupDto, req.user.id);
    }

    @Get('admin/all')
    @ApiOperation({ summary: 'Get all pickup requests (Admin)' })
    async findAll(
        @Query('status') status?: PickupStatus,
        @Query('cityId') cityId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('searchTerm') searchTerm?: string,
    ) {
        return this.pickupsService.findAll({ status, cityId, startDate, endDate, searchTerm });
    }

    @Get('my')
    @ApiOperation({ summary: 'Get current user pickup requests' })
    async findMyPickups(@Request() req) {
        return this.pickupsService.findMyPickups(req.user.id);
    }

    @Get('eligible-bookings')
    @ApiOperation({ summary: 'Get bookings eligible for pickup request' })
    async findEligibleBookings(@Request() req) {
        return this.pickupsService.findEligibleBookings(req.user.id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update pickup request status' })
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: PickupStatus,
        @Body('riderId') riderId?: string,
        @Body('riderName') riderName?: string,
        @Body('riderPhone') riderPhone?: string,
        @Request() req?: { user?: { id: string } },
    ) {
        const userId = req?.user?.id;
        return this.pickupsService.updateStatus(id, status, riderId, riderName, riderPhone, userId);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Cancel a pickup request' })
    async cancel(@Param('id') id: string, @Request() req) {
        return this.pickupsService.cancel(id, req.user.id, req.user.role);
    }
}
