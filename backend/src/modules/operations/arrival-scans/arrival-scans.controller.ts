import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArrivalScansService } from './arrival-scans.service';
import { CreateArrivalScanDto } from './dto/create-arrival-scan.dto';
import { UpdateArrivalScanDto } from './dto/update-arrival-scan.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Operations - Arrival Scans')
@Controller('arrival-scans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ArrivalScansController {
    constructor(private readonly arrivalScansService: ArrivalScansService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new arrival scan sheet' })
    async create(@Request() req, @Body() createDto: CreateArrivalScanDto) {
        return this.arrivalScansService.create(req.user.id, createDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all arrival scans' })
    async findAll(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        return this.arrivalScansService.findAll(startDate, endDate);
    }

    @Get('riders')
    @ApiOperation({ summary: 'List all active riders for arrival scan' })
    async getRiders() {
        return this.arrivalScansService.getRiders();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get details of an arrival scan sheet' })
    async findOne(@Param('id') id: string) {
        return this.arrivalScansService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Add more CNs to an existing arrival scan' })
    async update(@Param('id') id: string, @Request() req, @Body() updateDto: UpdateArrivalScanDto) {
        return this.arrivalScansService.update(id, req.user.id, updateDto);
    }

    @Post(':id/complete')
    @ApiOperation({ summary: 'Mark arrival scan as complete' })
    async complete(@Param('id') id: string) {
        return this.arrivalScansService.complete(id);
    }

    @Delete(':scanId/shipments/:shipmentId')
    @ApiOperation({ summary: 'Remove a shipment from arrival scan' })
    async removeShipment(
        @Param('scanId') scanId: string,
        @Param('shipmentId') shipmentId: string,
        @Request() req
    ) {
        return this.arrivalScansService.removeShipment(scanId, shipmentId, req.user.id);
    }
}
