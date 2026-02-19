import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@Injectable()
export class ConfigurationService {
    constructor(private prisma: PrismaService) { }

    async getConfiguration(userId: string) {
        // Get the configuration for the specific user
        const config = await this.prisma.configuration.findUnique({
            where: { userId },
            include: {
                station: true,
                updatedByUser: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
        return config || {};
    }

    async updateConfiguration(userId: string, updateConfigDto: UpdateConfigurationDto) {
        const { stationCode, ...rest } = updateConfigDto;

        // Use upsert to create or update user's configuration
        return this.prisma.configuration.upsert({
            where: { userId },
            update: {
                ...rest,
                stationCode,
                stationId: null,
                updatedBy: userId,
            },
            create: {
                ...rest,
                stationCode,
                stationId: null,
                userId,
                updatedBy: userId,
            },
        });
    }
}
