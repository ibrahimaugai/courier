import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateArrivalScanDto } from './dto/create-arrival-scan.dto';
import { UpdateArrivalScanDto } from './dto/update-arrival-scan.dto';
import { ArrivalScanStatus, BookingStatus } from '@prisma/client';

@Injectable()
export class ArrivalScansService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createDto: CreateArrivalScanDto) {
        const { arrivalCode, scanDate, riderName, cnNumbers } = createDto;

        // 1. Check if arrival code already exists
        const existing = await this.prisma.arrivalScan.findUnique({
            where: { arrivalCode },
        });
        if (existing) {
            throw new ConflictException(`Arrival sheet code ${arrivalCode} already exists`);
        }

        // 3. Start a transaction
        return this.prisma.$transaction(async (tx) => {
            // a. Create the ArrivalScan record
            const arrivalScan = await tx.arrivalScan.create({
                data: {
                    arrivalCode,
                    scanDate: new Date(scanDate),
                    riderName,
                    totalCns: cnNumbers.length,
                    status: ArrivalScanStatus.PENDING, // Start as PENDING so it can be continued
                    scannedBy: userId,
                },
            });

            // b. Process each CN
            for (const cn of cnNumbers) {
                // Find the booking
                const booking = await tx.booking.findUnique({
                    where: { cnNumber: cn },
                });

                if (!booking) {
                    throw new NotFoundException(`Consignment ${cn} not found`);
                }

                // Create ArrivalScanShipment
                await tx.arrivalScanShipment.create({
                    data: {
                        arrivalScanId: arrivalScan.id,
                        bookingId: booking.id,
                    },
                });

                // Update Booking Status to AT_HUB or AT_DEPOT
                // For arrival scan, it usually means it arrived at the current station/hub
                await tx.booking.update({
                    where: { id: booking.id },
                    data: {
                        status: BookingStatus.AT_HUB,
                    },
                });

                // Create Booking History
                await tx.bookingHistory.create({
                    data: {
                        bookingId: booking.id,
                        action: 'ARRIVAL_SCAN',
                        oldStatus: booking.status,
                        newStatus: BookingStatus.AT_HUB,
                        performedBy: userId,
                        remarks: `Arrived at station via sheet ${arrivalCode}`,
                    },
                });
            }

            return arrivalScan;
        });
    }

    async findAll(startDate?: string, endDate?: string) {
        const whereClause: any = {};

        if (startDate && endDate) {
            whereClause.scanDate = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        return this.prisma.arrivalScan.findMany({
            where: whereClause,
            include: {
                rider: true,
                scannedByUser: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                station: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const scan = await this.prisma.arrivalScan.findUnique({
            where: { id },
            include: {
                rider: true,
                station: true,
                scannedByUser: true,
                arrivalScanShipments: {
                    include: {
                        booking: {
                            include: {
                                originCity: true,
                                destinationCity: true,
                            },
                        },
                    },
                },
            },
        });

        if (!scan) {
            throw new NotFoundException(`Arrival scan with ID ${id} not found`);
        }

        return scan;
    }

    async getRiders() {
        return this.prisma.driver.findMany({
            where: { status: 'active' },
        });
    }

    async update(id: string, userId: string, updateDto: UpdateArrivalScanDto) {
        const { cnNumbers, riderName } = updateDto;

        // 1. Check if arrival scan exists
        const existingScan = await this.prisma.arrivalScan.findUnique({
            where: { id },
            include: {
                arrivalScanShipments: {
                    include: {
                        booking: true,
                    },
                },
            },
        });

        if (!existingScan) {
            throw new NotFoundException(`Arrival scan with ID ${id} not found`);
        }

        // 2. Get existing CN numbers
        const existingCNs = existingScan.arrivalScanShipments.map(s => s.booking.cnNumber);

        // 3. Filter out CNs that are already in the sheet
        const newCNs = cnNumbers.filter(cn => !existingCNs.includes(cn));

        if (newCNs.length === 0) {
            throw new BadRequestException('All provided CNs are already in this arrival sheet');
        }

        // 4. Start a transaction to add new CNs
        return this.prisma.$transaction(async (tx) => {
            // Process each new CN
            for (const cn of newCNs) {
                const booking = await tx.booking.findUnique({
                    where: { cnNumber: cn },
                });

                if (!booking) {
                    throw new NotFoundException(`Consignment ${cn} not found`);
                }

                // Create ArrivalScanShipment
                await tx.arrivalScanShipment.create({
                    data: {
                        arrivalScanId: existingScan.id,
                        bookingId: booking.id,
                    },
                });

                // Update Booking Status
                await tx.booking.update({
                    where: { id: booking.id },
                    data: {
                        status: BookingStatus.AT_HUB,
                    },
                });

                // Create Booking History
                await tx.bookingHistory.create({
                    data: {
                        bookingId: booking.id,
                        action: 'ARRIVAL_SCAN',
                        oldStatus: booking.status,
                        newStatus: BookingStatus.AT_HUB,
                        performedBy: userId,
                        remarks: `Arrived at station via sheet ${existingScan.arrivalCode}`,
                    },
                });
            }

            // Update the arrival scan
            const updatedScan = await tx.arrivalScan.update({
                where: { id },
                data: {
                    totalCns: existingScan.totalCns + newCNs.length,
                    ...(riderName && { riderName }),
                    updatedAt: new Date(),
                },
            });

            return updatedScan;
        });
    }

    async complete(id: string) {
        const scan = await this.prisma.arrivalScan.findUnique({
            where: { id },
        });

        if (!scan) {
            throw new NotFoundException(`Arrival scan with ID ${id} not found`);
        }

        if (scan.status === ArrivalScanStatus.COMPLETE) {
            throw new BadRequestException('Arrival scan is already completed');
        }

        return this.prisma.arrivalScan.update({
            where: { id },
            data: {
                status: ArrivalScanStatus.COMPLETE,
                completedAt: new Date(),
            },
        });
    }

    async removeShipment(scanId: string, shipmentId: string, userId: string) {
        // Find the shipment
        const shipment = await this.prisma.arrivalScanShipment.findUnique({
            where: { id: shipmentId },
            include: {
                arrivalScan: true,
                booking: true,
            },
        });

        if (!shipment) {
            throw new NotFoundException('Shipment not found in arrival scan');
        }

        if (shipment.arrivalScanId !== scanId) {
            throw new BadRequestException('Shipment does not belong to this arrival scan');
        }

        return this.prisma.$transaction(async (tx) => {
            // Delete the shipment
            await tx.arrivalScanShipment.delete({
                where: { id: shipmentId },
            });

            // Update total count
            await tx.arrivalScan.update({
                where: { id: scanId },
                data: {
                    totalCns: { decrement: 1 },
                },
            });

            // Revert booking status (optional - you may want to keep it as AT_HUB)
            // For now, we'll leave the booking status unchanged

            return { message: 'Shipment removed successfully' };
        });
    }
}
