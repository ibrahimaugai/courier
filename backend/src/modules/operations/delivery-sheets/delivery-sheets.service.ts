import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDeliverySheetDto } from './dto/create-delivery-sheet.dto';
import { UpdateDeliverySheetDto } from './dto/update-delivery-sheet.dto';
import { BookingStatus, DeliverySheetStatus, DeliveryPhase, DeliveryStatus } from '@prisma/client';

@Injectable()
export class DeliverySheetsService {
    constructor(private prisma: PrismaService) { }

    async create(createDto: CreateDeliverySheetDto, userId: string) {
        const { cnNumbers, ...data } = createDto;

        // Generate Sheet Number (Mock Logic or tailored)
        // Format: DS-YYYYMMDD-XXXX
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.prisma.deliverySheet.count({
            where: {
                sheetDate: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            }
        });
        const sheetNumber = `DS-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

        return this.prisma.$transaction(async (prisma) => {
            // 1. Create Delivery Sheet
            const sheet = await prisma.deliverySheet.create({
                data: {
                    ...data,
                    sheetNumber,
                    sheetDate: new Date(data.sheetDate),
                    createdBy: userId,
                    status: DeliverySheetStatus.PENDING,
                    phase: DeliveryPhase.PHASE1,
                },
            });

            // 2. Process CNs
            let totalCns = 0;
            let totalWeight = 0;
            let totalFod = 0;

            for (const cn of cnNumbers) {
                const booking = await prisma.booking.findUnique({ where: { cnNumber: cn } });
                if (!booking) {
                    throw new NotFoundException(`Booking CN ${cn} not found`);
                }

                // Validation: Should be AT_HUB or DE_MANIFESTED?
                // Allowing loose validation for now as per "Idempotent" request usually.

                // Create Shipment Relationship
                await prisma.deliverySheetShipment.create({
                    data: {
                        deliverySheetId: sheet.id,
                        bookingId: booking.id,
                        deliveryStatus: DeliveryStatus.PENDING
                    }
                });

                // Update Booking
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: {
                        status: BookingStatus.OUT_FOR_DELIVERY,
                        deliverySheetId: sheet.id,
                        updatedAt: new Date()
                    }
                });

                // Log History
                await prisma.bookingHistory.create({
                    data: {
                        bookingId: booking.id,
                        action: 'DELIVERY_PHASE_1_CREATED',
                        oldStatus: booking.status,
                        newStatus: BookingStatus.OUT_FOR_DELIVERY,
                        performedBy: userId,
                        remarks: `Added to Delivery Sheet ${sheetNumber}`
                    }
                });

                totalCns++;
                totalWeight += Number(booking.weight || 0);
                // FOD logic: if Topay/COD? simplified:
                if (booking.codAmount) totalFod += Number(booking.codAmount);
            }

            // 3. Update Sheet Totals
            return await prisma.deliverySheet.update({
                where: { id: sheet.id },
                data: {
                    totalCns,
                    totalWeight,
                    totalFod
                },
                include: {
                    rider: true,
                    // route: true // Commented out until prisma generate is run to avoid build errors
                }
            });
        });
    }

    async findAll(query: any) {
        const { startDate, endDate } = query;
        const where: any = {};

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            where.sheetDate = {
                gte: start,
                lte: end
            };
        }

        return this.prisma.deliverySheet.findMany({
            where,
            include: {
                rider: true,
                vehicle: true,
                createdByUser: { select: { username: true } },
                // route: true, // Commented out until prisma generate is run
                originStation: { select: { stationName: true, stationCode: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string) {
        const sheet = await this.prisma.deliverySheet.findUnique({
            where: { id },
            include: {
                rider: true,
                vehicle: true,
                // route: true, // Commented out until prisma generate is run
                originStation: true,
                bookings: true,
                deliverySheetShipments: true
            }
        });

        // To get bookings details, we might need to fetch them if the relation `bookings` isn't auto-populated by `deliverySheetShipments`
        // In schema, Booking has `deliverySheetId`. So `bookings` relation works.
        return sheet;
    }

    async getRoutes() {
        return this.prisma.route.findMany({
            where: { status: 'active' }
        });
    }
    async update(id: string, updateDto: UpdateDeliverySheetDto, userId: string) {
        const { cnNumbers, ...data } = updateDto;

        // 1. Check if delivery sheet exists
        const existingSheet = await this.prisma.deliverySheet.findUnique({
            where: { id },
            include: {
                bookings: true,
                deliverySheetShipments: true
            },
        });

        if (!existingSheet) {
            throw new NotFoundException(`Delivery sheet with ID ${id} not found`);
        }

        // 2. Get existing CN numbers via the direct bookings relation
        const existingCNs = existingSheet.bookings.map(b => b.cnNumber);

        // 3. Filter out CNs that are already in the sheet
        const newCNs = cnNumbers ? cnNumbers.filter(cn => !existingCNs.includes(cn)) : [];

        // 4. Start a transaction
        return this.prisma.$transaction(async (tx) => {
            let addedWeight = 0;
            let addedFod = 0;

            // Process each new CN
            if (newCNs.length > 0) {
                for (const cn of newCNs) {
                    const booking = await tx.booking.findUnique({ where: { cnNumber: cn } });
                    if (!booking) {
                        throw new NotFoundException(`Booking CN ${cn} not found`);
                    }

                    // Create Shipment Relationship
                    await tx.deliverySheetShipment.create({
                        data: {
                            deliverySheetId: id,
                            bookingId: booking.id,
                            deliveryStatus: DeliveryStatus.PENDING
                        }
                    });

                    // Update Booking
                    await tx.booking.update({
                        where: { id: booking.id },
                        data: {
                            status: BookingStatus.OUT_FOR_DELIVERY,
                            deliverySheetId: id,
                            updatedAt: new Date()
                        }
                    });

                    // Log History
                    await tx.bookingHistory.create({
                        data: {
                            bookingId: booking.id,
                            action: 'DELIVERY_PHASE_1_UPDATED',
                            oldStatus: booking.status,
                            newStatus: BookingStatus.OUT_FOR_DELIVERY,
                            performedBy: userId,
                            remarks: `Added to Delivery Sheet ${existingSheet.sheetNumber} (Update)`
                        }
                    });

                    addedWeight += Number(booking.weight || 0);
                    if (booking.codAmount) addedFod += Number(booking.codAmount);
                }
            }

            // Update Sheet
            return await tx.deliverySheet.update({
                where: { id },
                data: {
                    ...data,
                    sheetDate: data.sheetDate ? new Date(data.sheetDate) : existingSheet.sheetDate,
                    totalCns: existingSheet.totalCns + newCNs.length,
                    totalWeight: Number(existingSheet.totalWeight) + addedWeight,
                    totalFod: Number(existingSheet.totalFod) + addedFod,
                    updatedAt: new Date()
                },
                include: {
                    rider: true,
                    // route: true
                }
            });
        });
    }

    async complete(id: string) {
        const sheet = await this.prisma.deliverySheet.findUnique({
            where: { id },
        });

        if (!sheet) {
            throw new NotFoundException(`Delivery sheet with ID ${id} not found`);
        }

        if (sheet.status === DeliverySheetStatus.COMPLETED) {
            throw new BadRequestException('Delivery sheet is already completed');
        }

        return this.prisma.deliverySheet.update({
            where: { id },
            data: {
                status: DeliverySheetStatus.COMPLETED,
                completedAt: new Date(),
            },
        });
    }

    async removeShipment(sheetId: string, shipmentId: string, userId: string) {
        const shipment = await this.prisma.deliverySheetShipment.findUnique({
            where: { id: shipmentId }
        });

        if (!shipment) {
            throw new NotFoundException('Shipment relationship not found');
        }

        return this.prisma.$transaction(async (tx) => {
            await tx.deliverySheetShipment.delete({
                where: { id: shipmentId },
            });

            await tx.deliverySheet.update({
                where: { id: sheetId },
                data: {
                    totalCns: { decrement: 1 },
                },
            });

            return { message: 'Shipment removed successfully' };
        });
    }

    // Phase 2 Methods
    async updateShipmentStatus(
        sheetId: string,
        shipmentId: string,
        updateData: {
            deliveryStatus?: string;
            deliveryRemarks?: string;
            collectedAmount?: number;
        },
        userId: string
    ) {
        const shipment = await this.prisma.deliverySheetShipment.findUnique({
            where: { id: shipmentId },
            include: { booking: true }
        });

        if (!shipment) {
            throw new NotFoundException('Shipment not found');
        }

        if (shipment.deliverySheetId !== sheetId) {
            throw new BadRequestException('Shipment does not belong to this delivery sheet');
        }

        return this.prisma.$transaction(async (tx) => {
            // Update shipment status
            const updatedShipment = await tx.deliverySheetShipment.update({
                where: { id: shipmentId },
                data: {
                    deliveryStatus: updateData.deliveryStatus as any,
                    deliveryRemarks: updateData.deliveryRemarks,
                    deliveredAt: updateData.deliveryStatus === 'DELIVERED' ? new Date() : null,
                }
            });

            // Update booking status based on delivery status
            if (shipment.booking) {
                let newBookingStatus: BookingStatus;

                switch (updateData.deliveryStatus) {
                    case 'DELIVERED':
                        newBookingStatus = BookingStatus.DELIVERED;
                        break;
                    case 'RETURNED':
                        newBookingStatus = BookingStatus.RETURNED;
                        break;
                    default:
                        newBookingStatus = BookingStatus.OUT_FOR_DELIVERY;
                }

                await tx.booking.update({
                    where: { id: shipment.booking.id },
                    data: {
                        status: newBookingStatus,
                        deliveredAt: updateData.deliveryStatus === 'DELIVERED' ? new Date() : null,
                    }
                });

                // Log history
                await tx.bookingHistory.create({
                    data: {
                        bookingId: shipment.booking.id,
                        action: `DELIVERY_${updateData.deliveryStatus}`,
                        oldStatus: shipment.booking.status,
                        newStatus: newBookingStatus,
                        performedBy: userId,
                        remarks: updateData.deliveryRemarks || `Marked as ${updateData.deliveryStatus}`
                    }
                });
            }

            return updatedShipment;
        });
    }

    async closeSheet(sheetId: string, userId: string) {
        const sheet = await this.prisma.deliverySheet.findUnique({
            where: { id: sheetId },
            include: {
                deliverySheetShipments: true,
                bookings: true
            }
        });

        if (!sheet) {
            throw new NotFoundException('Delivery sheet not found');
        }

        if (sheet.status === DeliverySheetStatus.COMPLETED) {
            throw new BadRequestException('Delivery sheet is already closed');
        }

        // Update sheet to Phase 2 and mark as completed
        return this.prisma.deliverySheet.update({
            where: { id: sheetId },
            data: {
                phase: DeliveryPhase.PHASE2,
                status: DeliverySheetStatus.COMPLETED,
                completedAt: new Date(),
            },
            include: {
                rider: true,
                deliverySheetShipments: {
                    include: {
                        booking: true
                    }
                }
            }
        });
    }

    async getSheetForPhase2(sheetNumber: string) {
        const sheet = await this.prisma.deliverySheet.findFirst({
            where: {
                sheetNumber,
                // Allow both PHASE1 (pending) and PHASE2 (completed) sheets to be opened
                // This enables reopening closed sheets for corrections
            },
            include: {
                rider: true,
                vehicle: true,
                originStation: true,
                bookings: {
                    include: {
                        destinationCity: true,
                        customer: true
                    }
                },
                deliverySheetShipments: true
            }
        });

        if (!sheet) {
            throw new NotFoundException('Delivery sheet not found');
        }

        return sheet;
    }
}
