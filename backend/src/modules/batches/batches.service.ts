import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BatchStatus } from '@prisma/client';

@Injectable()
export class BatchesService {
    constructor(private prisma: PrismaService) { }

    async createBatch(data: {
        batchDate: string;
        stationCode: string;
        routeCode?: string;
        staffCode: string;
        adminId: string;
    }) {
        const { batchDate, stationCode, routeCode, staffCode, adminId } = data;

        const date = new Date(batchDate);
        if (isNaN(date.getTime())) {
            throw new BadRequestException('Invalid date format');
        }

        // Generate Batch Code: staffCode-YYYYMMDD-X
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const datePrefix = `${year}${month}${day}`;
        const prefix = `${staffCode}-${datePrefix}`;

        // Find latest batch for this staff and date to increment the counter
        const latestBatch = await this.prisma.batch.findFirst({
            where: {
                batchCode: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                batchCode: 'desc',
            },
        });

        let nextNumber = 1;
        if (latestBatch) {
            const lastCode = latestBatch.batchCode;
            const parts = lastCode.split('-');
            if (parts.length > 0) {
                const lastNum = parseInt(parts[parts.length - 1], 10);
                if (!isNaN(lastNum)) {
                    nextNumber = lastNum + 1;
                }
            }
        }

        const batchCode = `${prefix}-${nextNumber}`;

        // Create Batch - Saving codes as strings directly without DB validation
        return this.prisma.batch.create({
            data: {
                batchCode,
                batchDate: date,
                stationCode,
                routeCode,
                staffCode,
                status: BatchStatus.ACTIVE,
                // We still link the admin who created it to staffId
                staffId: adminId,
            }
        });
    }

    /**
     * Ensures an active batch exists for the user.
     * If not found, it creates one using the user's configuration.
     */
    async ensureActiveBatch(userId: string, tx?: any) {
        const prisma = tx || this.prisma;

        // 1. Find active batch for user
        let activeBatch = await prisma.batch.findFirst({
            where: {
                staffId: userId,
                status: BatchStatus.ACTIVE,
            },
            orderBy: { createdAt: 'desc' },
        });

        if (activeBatch) return activeBatch;

        // 2. If not found, get user's configuration
        const config = await prisma.configuration.findUnique({
            where: { userId },
        });

        if (!config || !config.stationCode || !config.staffCode) {
            throw new BadRequestException('Action denied: No active batch found and no system configuration set. Please update your Configuration first.');
        }

        // 3. Create new batch
        return this.createBatchInternal({
            batchDate: new Date().toISOString().split('T')[0],
            stationCode: config.stationCode,
            routeCode: config.routeCode,
            staffCode: config.staffCode,
            adminId: userId,
        }, prisma);
    }

    /**
     * Internal version of createBatch that can accept a transaction client
     */
    private async createBatchInternal(data: any, prisma: any) {
        const { batchDate, stationCode, routeCode, staffCode, adminId } = data;
        const date = new Date(batchDate);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const datePrefix = `${year}${month}${day}`;
        const prefix = `${staffCode}-${datePrefix}`;

        const latestBatch = await prisma.batch.findFirst({
            where: { batchCode: { startsWith: prefix } },
            orderBy: { batchCode: 'desc' },
        });

        let nextNumber = 1;
        if (latestBatch) {
            const lastCode = latestBatch.batchCode;
            const parts = lastCode.split('-');
            const lastNum = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastNum)) nextNumber = lastNum + 1;
        }

        const batchCode = `${prefix}-${nextNumber}`;

        return prisma.batch.create({
            data: {
                batchCode,
                batchDate: date,
                stationCode,
                routeCode,
                staffCode,
                status: BatchStatus.ACTIVE,
                staffId: adminId,
            }
        });
    }

    async getLatestBatch(userId: string, stationCodeParameter?: string) {
        const where: any = {
            status: BatchStatus.ACTIVE,
            staffId: userId // Filter by user
        };
        if (stationCodeParameter) {
            where.stationCode = stationCodeParameter;
        }
        return this.prisma.batch.findFirst({
            where,
            orderBy: { createdAt: 'desc' }
        });
    }

    async findAll(userId: string, date?: string) {
        const where: any = {
            staffId: userId // Filter by user
        };
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            where.batchDate = {
                gte: startOfDay,
                lte: endOfDay
            };
        }
        return this.prisma.batch.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                staff: {
                    select: {
                        staffCode: true
                    }
                }
            }
        });
    }

    async findOne(id: string) {
        const batch = await this.prisma.batch.findUnique({
            where: { id }
        });
        if (!batch) {
            throw new NotFoundException(`Batch with ID ${id} not found`);
        }
        return batch;
    }

    async updateStatus(id: string, status: BatchStatus) {
        const batch = await this.findOne(id);

        if (status === BatchStatus.ACTIVE) {
            // Ensure only one batch is active at a time for this user
            const where: any = {
                status: BatchStatus.ACTIVE,
                staffId: batch.staffId, // Only close batches for the same user
                id: { not: id }
            };

            await this.prisma.batch.updateMany({
                where,
                data: {
                    status: BatchStatus.CLOSED,
                    closedAt: new Date(),
                }
            });
        }

        return this.prisma.batch.update({
            where: { id },
            data: {
                status,
                closedAt: status === BatchStatus.CLOSED ? new Date() : null,
                closedBy: status === BatchStatus.CLOSED ? batch.staffId : null
            }
        });
    }
}
