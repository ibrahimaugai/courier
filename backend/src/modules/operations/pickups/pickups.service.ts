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

    async findAll(filters: any) {
        const { status, cityId, startDate, endDate, searchTerm } = filters;
        const where: any = {};

        if (status) where.status = status;
        if (cityId) {
            where.booking = { originCityId: cityId };
        }
        if (startDate || endDate) {
            where.pickupDate = {};
            if (startDate) where.pickupDate.gte = new Date(startDate);
            if (endDate) where.pickupDate.lte = new Date(endDate);
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
                        cnNumber: true,
                        customer: { select: { name: true } },
                        originCity: { select: { cityName: true } },
                        destinationCity: { select: { cityName: true } },
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
                            cnNumber: true,
                            originCity: { select: { cityName: true } },
                            destinationCity: { select: { cityName: true } },
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

    async findEligibleBookings(userId: string) {
        try {
            this.logger.log(`Fetching eligible bookings for user: ${userId}`);
            // Bookings that are BOOKED and don't have an active pickup request
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

    async updateStatus(id: string, status: PickupStatus, riderId?: string) {
        const data: any = { status };
        if (riderId) data.assignedRiderId = riderId;

        return this.prisma.pickupRequest.update({
            where: { id },
            data,
            include: {
                booking: true,
                assignedRider: true,
            }
        });
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
