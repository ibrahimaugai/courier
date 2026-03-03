import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePickupDto } from './dto/create-pickup.dto';
import { PickupStatus } from '@prisma/client';

@Injectable()
export class PickupsService {
    private readonly logger = new Logger(PickupsService.name);
    constructor(private prisma: PrismaService) { }

    async create(createPickupDto: CreatePickupDto, userId: string) {
        try {
            this.logger.log(`Creating pickup for user: ${userId}, bookingId: ${createPickupDto.bookingId}`);
            const { bookingId, ...details } = createPickupDto;

            // Verify booking exists and belongs to user (or user is admin)
            const booking = await this.prisma.booking.findUnique({
                where: { id: bookingId },
            });

            if (!booking) {
                this.logger.warn(`Booking not found: ${bookingId}`);
                throw new NotFoundException('Booking not found');
            }

            // Check if a pickup already exists for this booking
            const existingPickup = await this.prisma.pickupRequest.findFirst({
                where: {
                    bookingId,
                    status: { not: PickupStatus.CANCELLED },
                },
            });

            if (existingPickup) {
                this.logger.warn(`Pickup already exists for booking: ${bookingId}`);
                throw new BadRequestException('A pickup request already exists for this booking');
            }

            return await this.prisma.$transaction(async (tx) => {
                const pickup = await tx.pickupRequest.create({
                    data: {
                        ...details,
                        pickupDate: new Date(details.pickupDate),
                        booking: { connect: { id: bookingId } },
                        createdByUser: { connect: { id: userId } },
                    },
                    include: {
                        booking: {
                            select: {
                                cnNumber: true,
                                originCity: { select: { cityName: true } },
                                destinationCity: { select: { cityName: true } },
                            }
                        }
                    }
                });

                // Update booking status
                await tx.booking.update({
                    where: { id: bookingId },
                    data: { status: 'PICKUP_REQUESTED' as any }
                });

                // Add to booking history
                await tx.bookingHistory.create({
                    data: {
                        bookingId,
                        action: 'PICKUP_REQUESTED',
                        oldStatus: booking.status,
                        newStatus: 'PICKUP_REQUESTED' as any,
                        performedBy: userId,
                        remarks: 'Pickup request created'
                    }
                });

                return pickup;
            });
        } catch (error) {
            this.logger.error(`Error in create pickup: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Create pickup requests for all eligible bookings in a batch (same details for all).
     */
    async createBatchPickup(
        batchId: string,
        details: {
            pickupAddress: string;
            pickupDate: string;
            pickupTime?: string;
            contactName: string;
            contactPhone: string;
            specialInstructions?: string;
        },
        userId: string,
    ) {
        const batch = await this.prisma.batch.findUnique({ where: { id: batchId } });
        if (!batch) {
            throw new NotFoundException('Batch not found');
        }

        const eligibleBookings = await this.prisma.booking.findMany({
            where: {
                batchId,
                createdBy: userId,
                status: 'BOOKED',
                pickupRequests: {
                    none: { status: { not: PickupStatus.CANCELLED } },
                },
            },
        });

        if (eligibleBookings.length === 0) {
            throw new BadRequestException(
                'No eligible shipments in this batch for pickup. All may already have a pickup request or are not in BOOKED status.',
            );
        }

        const pickupDate = new Date(details.pickupDate);
        const created: string[] = [];

        await this.prisma.$transaction(async (tx) => {
            for (const booking of eligibleBookings) {
                const pickup = await tx.pickupRequest.create({
                    data: {
                        pickupAddress: details.pickupAddress,
                        pickupDate,
                        pickupTime: details.pickupTime ?? null,
                        contactName: details.contactName,
                        contactPhone: details.contactPhone,
                        specialInstructions: details.specialInstructions ?? null,
                        booking: { connect: { id: booking.id } },
                        createdByUser: { connect: { id: userId } },
                    },
                });
                created.push(pickup.id);
                await tx.booking.update({
                    where: { id: booking.id },
                    data: { status: 'PICKUP_REQUESTED' as any },
                });
                await tx.bookingHistory.create({
                    data: {
                        bookingId: booking.id,
                        action: 'PICKUP_REQUESTED',
                        oldStatus: booking.status,
                        newStatus: 'PICKUP_REQUESTED' as any,
                        performedBy: userId,
                        remarks: 'Pickup request created (batch)',
                    },
                });
            }
        });

        this.logger.log(`Batch pickup: ${created.length} pickups created for batch ${batch.batchCode}`);
        return {
            created: created.length,
            batchCode: batch.batchCode,
            bookingIds: eligibleBookings.map((b) => b.id),
        };
    }

    async findAll(filters: any) {
        const { status, cityId, startDate, endDate, searchTerm } = filters;
        const where: any = {};

        if (status) where.status = status;
        if (cityId) {
            where.booking = { originCityId: cityId };
        }
        if (startDate || endDate) {
            where.pickupDate = {};
            if (startDate) where.pickupDate.gte = new Date(startDate + 'T00:00:00.000Z');
            if (endDate) where.pickupDate.lte = new Date(endDate + 'T23:59:59.999Z');
        }
        if (searchTerm) {
            where.OR = [
                { booking: { cnNumber: { contains: searchTerm, mode: 'insensitive' } } },
                { contactName: { contains: searchTerm, mode: 'insensitive' } },
                { contactPhone: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }

        return this.prisma.pickupRequest.findMany({
            where,
            include: {
                booking: {
                    select: {
                        id: true,
                        cnNumber: true,
                        batchId: true,
                        batch: { select: { id: true, batchCode: true, status: true } },
                        customer: { select: { name: true, phone: true, address: true, email: true } },
                        originCity: { select: { cityName: true } },
                        destinationCity: { select: { cityName: true } },
                        service: { select: { serviceName: true, serviceCode: true, serviceType: true } },
                        product: { select: { productName: true, productCode: true } },
                        weight: true,
                        pieces: true,
                        chargeableWeight: true,
                        rate: true,
                        totalAmount: true,
                        codAmount: true,
                        otherAmount: true,
                        paymentMode: true,
                        consigneeName: true,
                        consigneePhone: true,
                        consigneeAddress: true,
                        consigneeEmail: true,
                        consigneeCompanyName: true,
                        shipperName: true,
                        shipperPhone: true,
                        shipperAddress: true,
                        shipperEmail: true,
                        shipperCompanyName: true,
                        packetContent: true,
                        handlingInstructions: true,
                    }
                },
                assignedRider: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findMyPickups(userId: string) {
        try {
            this.logger.log(`Fetching pickups for user: ${userId}`);
            return await this.prisma.pickupRequest.findMany({
                where: { createdBy: userId },
                include: {
                    booking: {
                        select: {
                            id: true,
                            cnNumber: true,
                            batchId: true,
                            batch: { select: { id: true, batchCode: true, status: true } },
                            customer: { select: { name: true, phone: true, address: true, email: true } },
                            originCity: { select: { cityName: true } },
                            destinationCity: { select: { cityName: true } },
                            service: { select: { serviceName: true, serviceCode: true, serviceType: true } },
                            product: { select: { productName: true, productCode: true } },
                            weight: true,
                            pieces: true,
                            chargeableWeight: true,
                            rate: true,
                            totalAmount: true,
                            codAmount: true,
                            otherAmount: true,
                            paymentMode: true,
                            consigneeName: true,
                            consigneePhone: true,
                            consigneeAddress: true,
                            consigneeEmail: true,
                            shipperName: true,
                            shipperPhone: true,
                            shipperAddress: true,
                            shipperEmail: true,
                            shipperCompanyName: true,
                            packetContent: true,
                            handlingInstructions: true,
                        }
                    },
                    assignedRider: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            this.logger.error(`Error in findMyPickups: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Batches that have at least one eligible booking (BOOKED, no active pickup) for the user.
     */
    async findEligibleBatches(userId: string) {
        const eligibleBookings = await this.prisma.booking.findMany({
            where: {
                createdBy: userId,
                status: 'BOOKED',
                batchId: { not: null },
                pickupRequests: {
                    none: { status: { not: PickupStatus.CANCELLED } },
                },
            },
            select: {
                batchId: true,
                batch: { select: { id: true, batchCode: true, status: true } },
            },
        });
        const byBatch = new Map<string, { batchCode: string; count: number }>();
        for (const b of eligibleBookings) {
            if (!b.batchId || !b.batch) continue;
            const existing = byBatch.get(b.batchId);
            if (existing) {
                existing.count += 1;
            } else {
                byBatch.set(b.batchId, { batchCode: b.batch.batchCode, count: 1 });
            }
        }
        return Array.from(byBatch.entries()).map(([batchId, { batchCode, count }]) => ({
            batchId,
            batchCode,
            eligibleCount: count,
        }));
    }

    async findEligibleBookings(userId: string) {
        try {
            this.logger.log(`Fetching eligible bookings for user: ${userId}`);
            const bookings = await this.prisma.booking.findMany({
                where: {
                    createdBy: userId,
                    status: 'BOOKED',
                    pickupRequests: {
                        none: {
                            status: { not: PickupStatus.CANCELLED }
                        }
                    }
                },
                include: {
                    originCity: { select: { cityName: true } },
                    destinationCity: { select: { cityName: true } },
                    customer: { select: { name: true, phone: true, address: true } }
                }
            });
            this.logger.log(`Found ${bookings.length} eligible bookings`);
            return bookings;
        } catch (error) {
            this.logger.error(`Error in findEligibleBookings: ${error.message}`, error.stack);
            throw error;
        }
    }

    async updateStatus(id: string, status: PickupStatus, riderId?: string, riderName?: string, riderPhone?: string, userId?: string) {
        const data: any = { status };
        if (riderId) data.assignedRiderId = riderId;
        if (riderName) data.riderName = riderName;
        if (riderPhone !== undefined) data.riderPhone = riderPhone || null;

        // Update booking status to RIDER_ON_WAY when rider is assigned, and add history
        if (status === 'ASSIGNED' && (riderId || riderName)) {
            const pickup = await this.prisma.pickupRequest.findUnique({
                where: { id },
                select: { bookingId: true }
            });

            if (pickup) {
                const booking = await this.prisma.booking.findUnique({
                    where: { id: pickup.bookingId },
                    select: { status: true }
                });
                await this.prisma.booking.update({
                    where: { id: pickup.bookingId },
                    data: { status: 'RIDER_ON_WAY' as any }
                });
                if (booking && userId) {
                    await this.prisma.bookingHistory.create({
                        data: {
                            bookingId: pickup.bookingId,
                            action: 'RIDER_ASSIGNED',
                            oldStatus: booking.status as any,
                            newStatus: 'RIDER_ON_WAY' as any,
                            performedBy: userId,
                            remarks: riderName ? `Rider assigned: ${riderName}` : 'Rider assigned'
                        }
                    });
                }
            }
        }

        return this.prisma.pickupRequest.update({
            where: { id },
            data,
            include: {
                booking: true,
                assignedRider: true,
            }
        });
    }

    async assignRiderBulk(pickupIds: string[], riderName: string, riderPhone: string, userId?: string) {
        if (!pickupIds?.length) return [];
        const results: any[] = [];
        for (const id of pickupIds) {
            try {
                const updated = await this.updateStatus(id, 'ASSIGNED', undefined, riderName, riderPhone, userId);
                results.push(updated);
            } catch (err) {
                this.logger.warn(`assignRiderBulk: failed for pickup ${id}: ${err?.message}`);
            }
        }
        return results;
    }

    async cancel(id: string, userId: string, role: string) {
        const pickup = await this.prisma.pickupRequest.findUnique({
            where: { id },
        });

        if (!pickup) {
            throw new NotFoundException('Pickup request not found');
        }

        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && pickup.createdBy !== userId) {
            throw new BadRequestException('You do not have permission to cancel this pickup request');
        }

        return await this.prisma.$transaction(async (tx) => {
            const updatedPickup = await tx.pickupRequest.update({
                where: { id },
                data: { status: PickupStatus.CANCELLED },
            });

            // Revert booking status to BOOKED
            await tx.booking.update({
                where: { id: pickup.bookingId },
                data: { status: 'BOOKED' as any }
            });

            // Add to booking history
            await tx.bookingHistory.create({
                data: {
                    bookingId: pickup.bookingId,
                    action: 'PICKUP_CANCELLED',
                    oldStatus: 'PICKUP_REQUESTED' as any,
                    newStatus: 'BOOKED' as any,
                    performedBy: userId,
                    remarks: 'Pickup request cancelled'
                }
            });

            return updatedPickup;
        });
    }
}
