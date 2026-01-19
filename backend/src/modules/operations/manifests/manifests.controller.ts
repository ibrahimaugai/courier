import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ManifestsService } from './manifests.service';
import { CreateManifestDto } from './dto/create-manifest.dto';
import { UpdateManifestDto } from './dto/update-manifest.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Operations - Manifests')
@Controller('manifests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ManifestsController {
    constructor(private readonly manifestsService: ManifestsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new manifest' })
    async create(@Request() req, @Body() createDto: CreateManifestDto) {
        return this.manifestsService.create(req.user.id, createDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all manifests' })
    async findAll(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string, @Query('code') code?: string) {
        return this.manifestsService.findAll(startDate, endDate, code);
    }

    @Get('drivers')
    @ApiOperation({ summary: 'List all active drivers for manifest' })
    async getDrivers() {
        return this.manifestsService.getDrivers();
    }

    @Get('vehicles')
    @ApiOperation({ summary: 'List all active vehicles for manifest' })
    async getVehicles() {
        return this.manifestsService.getVehicles();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get details of a manifest' })
    async findOne(@Param('id') id: string) {
        return this.manifestsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Add more CNs to an existing manifest' })
    async update(@Param('id') id: string, @Request() req, @Body() updateDto: UpdateManifestDto) {
        return this.manifestsService.update(id, req.user.id, updateDto);
    }

    @Post(':id/complete')
    @ApiOperation({ summary: 'Mark manifest as complete' })
    async complete(@Param('id') id: string, @Request() req) {
        return this.manifestsService.complete(id, req.user.id);
    }

    @Delete(':manifestId/shipments/:shipmentId')
    @ApiOperation({ summary: 'Remove a shipment from manifest' })
    async removeShipment(
        @Param('manifestId') manifestId: string,
        @Param('shipmentId') shipmentId: string,
        @Request() req
    ) {
        return this.manifestsService.removeShipment(manifestId, shipmentId, req.user.id);
    }
}
