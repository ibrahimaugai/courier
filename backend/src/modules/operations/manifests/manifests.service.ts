import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateManifestDto } from './dto/create-manifest.dto';
import { UpdateManifestDto } from './dto/update-manifest.dto';
import { ManifestStatus, BookingStatus } from '@prisma/client';

@Injectable()
export class ManifestsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createDto: CreateManifestDto) {
        const { manifestCode, manifestDate, driverName, driverId, vehicleId, manifestSealNo, teller, staffDriverPhone, vehicleNo, vehicleSize, vehicleVendor, route, cnNumbers } = createDto;

        // 1. Check if manifest code already exists
        const existing = await this.prisma.manifest.findUnique({
            where: { manifestCode },
        });
        if (existing) {
            throw new ConflictException(`Manifest code ${manifestCode} already exists`);
        }

        // 2. Start a transaction
        return this.prisma.$transaction(async (tx) => {
            // a. Create the Manifest record
            const manifest = await tx.manifest.create({
                data: {
                    manifestCode,
                    manifestDate: new Date(manifestDate),
                    driverName,
                    driverId,
                    vehicleId,
                    manifestSealNo,
                    teller,
                    staffDriverPhone,
                    vehicleNo,
                    vehicleSize,
                    vehicleVendor,
                    route,
                    totalCns: cnNumbers.length,
                    status: ManifestStatus.PENDING,
                    createdBy: userId,
                },
            });

            // b. Process each CN
            for (const cn of cnNumbers) {
                const booking = await tx.booking.findUnique({
                    where: { cnNumber: cn },
                });

                if (!booking) {
                    throw new NotFoundException(`Consignment ${cn} not found`);
                }

                // Create ManifestShipment
                await tx.manifestShipment.create({
                    data: {
                        manifestId: manifest.id,
                        bookingId: booking.id,
                    },
                });

                // Update Booking Status to IN_TRANSIT
                await tx.booking.update({
                    where: { id: booking.id },
                    data: {
                        status: BookingStatus.IN_TRANSIT,
                        manifestId: manifest.id,
                    },
                });

                // Create Booking History
                await tx.bookingHistory.create({
                    data: {
                        bookingId: booking.id,
                        action: 'MANIFESTED',
                        oldStatus: booking.status,
                        newStatus: BookingStatus.IN_TRANSIT,
                        performedBy: userId,
                        remarks: `Added to manifest ${manifestCode}`,
                    },
                });
            }

            return manifest;
        });
    }

    async findAll(startDate?: string, endDate?: string, code?: string) {
        const whereClause: any = {};

        if (code) {
            whereClause.manifestCode = code;
        }

        if (startDate && endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            whereClause.manifestDate = {
                gte: new Date(startDate),
                lte: end,
            };
        }

        return this.prisma.manifest.findMany({
            where: whereClause,
            include: {
                driver: true,
                vehicle: true,
                createdByUser: {
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
        const manifest = await this.prisma.manifest.findUnique({
            where: { id },
            include: {
                driver: true,
                vehicle: true,
                station: true,
                createdByUser: true,
                manifestShipments: {
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

        if (!manifest) {
            throw new NotFoundException(`Manifest with ID ${id} not found`);
        }

        return manifest;
    }

    async update(id: string, userId: string, updateDto: UpdateManifestDto) {
        const { cnNumbers, driverName, manifestSealNo, teller, staffDriverPhone, vehicleNo, vehicleSize, vehicleVendor, route } = updateDto;

        // 1. Check if manifest exists
        const existingManifest = await this.prisma.manifest.findUnique({
            where: { id },
            include: {
                manifestShipments: {
                    include: {
                        booking: true,
                    },
                },
            },
        });

        if (!existingManifest) {
            throw new NotFoundException(`Manifest with ID ${id} not found`);
        }

        // 2. Get existing CN numbers
        const existingCNs = existingManifest.manifestShipments.map(s => s.booking.cnNumber);

        // 3. Filter out CNs that are already in the manifest
        const newCNs = cnNumbers ? cnNumbers.filter(cn => !existingCNs.includes(cn)) : [];

        // 4. Start a transaction to add new CNs and update manifest
        return this.prisma.$transaction(async (tx) => {
            // Process each new CN if any
            if (newCNs.length > 0) {
                for (const cn of newCNs) {
                    const booking = await tx.booking.findUnique({
                        where: { cnNumber: cn },
                    });

                    if (!booking) {
                        throw new NotFoundException(`Consignment ${cn} not found`);
                    }

                    // Create ManifestShipment
                    await tx.manifestShipment.create({
                        data: {
                            manifestId: existingManifest.id,
                            bookingId: booking.id,
                        },
                    });

                    // Update Booking Status
                    await tx.booking.update({
                        where: { id: booking.id },
                        data: {
                            status: BookingStatus.IN_TRANSIT,
                            manifestId: existingManifest.id,
                        },
                    });

                    // Create Booking History
                    await tx.bookingHistory.create({
                        data: {
                            bookingId: booking.id,
                            action: 'MANIFESTED',
                            oldStatus: booking.status,
                            newStatus: BookingStatus.IN_TRANSIT,
                            performedBy: userId,
                            remarks: `Added to manifest ${existingManifest.manifestCode}`,
                        },
                    });
                }
            }

            // Update the manifest (always update metadata if provided)
            const updatedManifest = await tx.manifest.update({
                where: { id },
                data: {
                    ...(newCNs.length > 0 && { totalCns: existingManifest.totalCns + newCNs.length }),
                    ...(driverName !== undefined && { driverName }),
                    ...(manifestSealNo !== undefined && { manifestSealNo }),
                    ...(teller !== undefined && { teller }),
                    ...(staffDriverPhone !== undefined && { staffDriverPhone }),
                    ...(vehicleNo !== undefined && { vehicleNo }),
                    ...(vehicleSize !== undefined && { vehicleSize }),
                    ...(vehicleVendor !== undefined && { vehicleVendor }),
                    ...(route !== undefined && { route }),
                    updatedAt: new Date(),
                },
            });

            return updatedManifest;
        });
    }

    async complete(id: string, userId: string) {
        const manifest = await this.prisma.manifest.findUnique({
            where: { id },
            include: {
                manifestShipments: {
                    include: {
                        booking: true
                    }
                }
            }
        });

        if (!manifest) {
            throw new NotFoundException(`Manifest with ID ${id} not found`);
        }

        // Allow re-completing (idempotent) to process late scans or fixes
        // if (manifest.status === ManifestStatus.COMPLETED) {
        //     throw new BadRequestException('Manifest is already completed');
        // }

        // Transaction to update manifest and all bookings
        return this.prisma.$transaction(async (tx) => {
            // 1. Update Manifest
            const updatedManifest = await tx.manifest.update({
                where: { id },
                data: {
                    status: ManifestStatus.COMPLETED,
                    completedAt: new Date(), // Update timestamp to reflect latest action
                },
            });

            // 2. Update Bookings to AT_HUB (Received)
            // We iterate to add specific history logs
            for (const shipment of manifest.manifestShipments) {
                // Skip if already updated to prevent duplicate logs/history
                if (shipment.booking.status === BookingStatus.AT_HUB) {
                    continue;
                }

                await tx.booking.update({
                    where: { id: shipment.bookingId },
                    data: {
                        status: BookingStatus.AT_HUB,
                    }
                });

                await tx.bookingHistory.create({
                    data: {
                        bookingId: shipment.bookingId,
                        action: 'DE_MANIFESTED',
                        oldStatus: shipment.booking.status,
                        newStatus: BookingStatus.AT_HUB,
                        performedBy: userId,
                        remarks: `Manifest ${manifest.manifestCode} completed/de-manifested`,
                    }
                });
            }

            return updatedManifest;
        });
    }

    async removeShipment(manifestId: string, shipmentId: string, userId: string) {
        // Find the shipment
        const shipment = await this.prisma.manifestShipment.findUnique({
            where: { id: shipmentId },
            include: {
                manifest: true,
                booking: true,
            },
        });

        if (!shipment) {
            throw new NotFoundException('Shipment not found in manifest');
        }

        if (shipment.manifestId !== manifestId) {
            throw new BadRequestException('Shipment does not belong to this manifest');
        }

        return this.prisma.$transaction(async (tx) => {
            // Delete the shipment
            await tx.manifestShipment.delete({
                where: { id: shipmentId },
            });

            // Update total count
            await tx.manifest.update({
                where: { id: manifestId },
                data: {
                    totalCns: { decrement: 1 },
                },
            });

            // Update booking to remove manifest reference
            await tx.booking.update({
                where: { id: shipment.booking.id },
                data: {
                    manifestId: null,
                },
            });

            return { message: 'Shipment removed successfully' };
        });
    }

    async getDrivers() {
        return this.prisma.driver.findMany({
            where: { status: 'active' },
        });
    }

    async getVehicles() {
        return this.prisma.vehicle.findMany({
            where: { status: 'active' },
        });
    }
}
