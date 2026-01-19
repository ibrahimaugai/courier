import { Controller, Post, Get, Body, UseGuards, Request, Query, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BatchesService } from './batches.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BatchStatus } from '@prisma/client';

@ApiTags('Batches')
@Controller('batches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BatchesController {
    constructor(private readonly batchesService: BatchesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new batch' })
    async create(
        @Body() data: {
            batchDate: string;
            stationCode: string;
            routeCode?: string;
            staffCode: string;
        },
        @Request() req,
    ) {
        return this.batchesService.createBatch({
            ...data,
            adminId: req.user.id,
        });
    }

    @Get()
    @ApiOperation({ summary: 'Get all batches' })
    async findAll(@Request() req, @Query('date') date?: string) {
        return this.batchesService.findAll(req.user.id, date);
    }

    @Get('latest')
    @ApiOperation({ summary: 'Get latest active batch' })
    async getLatest(@Request() req, @Query('stationCode') stationCode?: string) {
        return this.batchesService.getLatestBatch(req.user.id, stationCode);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update batch status' })
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: BatchStatus,
    ) {
        return this.batchesService.updateStatus(id, status);
    }
}
