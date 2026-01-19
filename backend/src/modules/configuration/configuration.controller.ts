import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigurationService } from './configuration.service';
import { BatchesService } from '../batches/batches.service';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Configuration')
@Controller('configurations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConfigurationController {
    constructor(
        private readonly configService: ConfigurationService,
        private readonly batchesService: BatchesService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get system configuration' })
    async get(@Request() req) {
        const config = await this.configService.getConfiguration(req.user.id);

        let batchInfo: any = { status: 'none' };
        try {
            const batch = await this.batchesService.getLatestBatch(req.user.id);
            if (batch && batch.status === 'ACTIVE') {
                batchInfo = { status: 'active', batchCode: batch.batchCode };
            } else {
                // If it's missing, try to ensure one if config is valid
                const ensuredBatch = await this.batchesService.ensureActiveBatch(req.user.id);
                batchInfo = { status: 'active', batchCode: ensuredBatch.batchCode };
            }
        } catch (error) {
            batchInfo = { status: 'error', message: error.message };
        }

        return { config, batchInfo };
    }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update system configuration' })
    async update(@Request() req, @Body() updateConfigDto: UpdateConfigurationDto) {
        const config = await this.configService.updateConfiguration(req.user.id, updateConfigDto);

        // After update, try to ensure batch
        let batchInfo: any = { status: 'none' };
        try {
            const batch = await this.batchesService.ensureActiveBatch(req.user.id);
            batchInfo = { status: 'active', batchCode: batch.batchCode };
        } catch (error) {
            batchInfo = { status: 'error', message: error.message };
        }

        return { config, batchInfo };
    }
}
