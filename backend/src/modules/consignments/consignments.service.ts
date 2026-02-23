import { randomUUID } from 'node:crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { CnGenerator } from '../../common/utils/cn-generator';
import { PaymentMode, BookingStatus, Prisma } from '@prisma/client';

import { BatchesService } from '../batches/batches.service';

@Injectable()
export class ConsignmentsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private batchesService: BatchesService,
  ) { }

  /**
   * Find or create a customer by phone/email (using transaction client)
   * For admin: creates/finds walk-in customer
   * For user: finds/creates customer linked to their account
   */
  private async findOrCreateCustomerWithTx(
    shipperData: {
      mobileNumber: string;
      fullName: string;
      companyName?: string;
      address: string;
      address2?: string;
      landlineNumber?: string;
      emailAddress?: string;
      cnicNumber?: string;
      originCityId: string;
    },
    userId: string,
    userRole: string,
    tx: any,
  ) {
    // Try to find existing customer by phone
    let customer = await tx.customer.findFirst({
      where: {
        phone: shipperData.mobileNumber,
      },
    });

    // If customer doesn't exist, create a new one
    if (!customer) {
      // Generate customer code
      const customerCount = await tx.customer.count();
      const customerCode = `CUST-${String(customerCount + 1).padStart(6, '0')}`;

      const customerData: any = {
        customerCode,
        name: shipperData.fullName,
        phone: shipperData.mobileNumber,
        address: shipperData.address + (shipperData.address2 ? `, ${shipperData.address2}` : ''),
        cityId: shipperData.originCityId,
        cnic: shipperData.cnicNumber,
        status: 'active',
      };

      // Add email if provided
      if (shipperData.emailAddress) {
        customerData.email = shipperData.emailAddress;
      }

      customer = await tx.customer.create({
        data: customerData,
      });
    } else {
      // Update customer information if provided
      const updateData: any = {};
      if (shipperData.fullName && customer.name !== shipperData.fullName) {
        updateData.name = shipperData.fullName;
      }
      if (shipperData.address) {
        updateData.address = shipperData.address + (shipperData.address2 ? `, ${shipperData.address2}` : '');
      }
      if (shipperData.cnicNumber && customer.cnic !== shipperData.cnicNumber) {
        updateData.cnic = shipperData.cnicNumber;
      }
      if (shipperData.emailAddress && customer.email !== shipperData.emailAddress) {
        updateData.email = shipperData.emailAddress;
      }

      if (Object.keys(updateData).length > 0) {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: updateData,
        });
      }
    }

    return customer;
  }

  /**
   * Upload documents to Cloudinary
   */
  private async uploadDocuments(
    documents: Array<{ buffer: Buffer; filename: string; name: string; price: number }>,
  ): Promise<Array<{ name: string; price: number; url: string }>> {
    if (!documents || documents.length === 0) {
      return [];
    }

    try {
      const uploadResults = await this.cloudinaryService.uploadMultipleFiles(
        documents.map((doc) => ({
          buffer: doc.buffer,
          filename: doc.filename,
        })),
        'courier-documents',
      );

      return uploadResults.map((result, index) => ({
        name: documents[index].name,
        price: documents[index].price,
        url: result.secureUrl,
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload documents: ${error.message}`,
      );
    }
  }

  private async resolveService(serviceIdentifier: string, tx: any) {
    if (!serviceIdentifier) return null;

    // 1. Try as UUID
    let service = await tx.service.findUnique({
      where: { id: serviceIdentifier },
    });
    if (service) return service;

    // 2. Try exact name match with the full input (to handle "INTL - NON DOCUMENTS" record we just fixed)
    service = await tx.service.findFirst({
      where: { serviceName: { equals: serviceIdentifier, mode: 'insensitive' }, status: 'active' },
    });
    if (service) return service;

    // 3. Try exact code match
    service = await tx.service.findFirst({
      where: { serviceCode: { equals: serviceIdentifier, mode: 'insensitive' }, status: 'active' },
    });
    if (service) return service;

    // 4. Handle "CODE - NAME" format
    if (serviceIdentifier.includes(' - ')) {
      const parts = serviceIdentifier.split(' - ');
      const codePart = parts[0].trim();
      const namePart = parts[1].trim();

      // a. Try to find by code + name parts combination
      service = await tx.service.findFirst({
        where: {
          serviceCode: { equals: codePart, mode: 'insensitive' },
          serviceName: { equals: namePart, mode: 'insensitive' },
          status: 'active',
        },
      });
      if (service) return service;

      // b. Collision check: If code exists but name is different
      const existingWithShortCode = await tx.service.findUnique({ where: { serviceCode: codePart } });
      if (existingWithShortCode) {
        if (existingWithShortCode.serviceName.toLowerCase() === namePart.toLowerCase()) {
          return existingWithShortCode;
        } else {
          // Collision! (e.g. INTL belongs to DOCUMENTS, but we want NON DOCUMENTS)
          // Use full identifier as name to avoid confusion
          const fullMatch = await tx.service.findFirst({
            where: { serviceName: { equals: serviceIdentifier, mode: 'insensitive' } }
          });
          if (fullMatch) return fullMatch;

          // Create with a unique, clean code
          const slugCode = serviceIdentifier.toUpperCase().replace(/[\s-]+/g, '_').substring(0, 30);
          const existingBySlug = await tx.service.findUnique({ where: { serviceCode: slugCode } });
          if (existingBySlug) return existingBySlug;

          return await tx.service.create({
            data: {
              serviceCode: slugCode,
              serviceName: serviceIdentifier,
              serviceType: 'GENERAL',
              status: 'active'
            }
          });
        }
      }
    }

    // 5. Final fallback
    const slug = serviceIdentifier.toUpperCase().replace(/[\s-]+/g, '_').substring(0, 30);
    const finalExisting = await tx.service.findUnique({ where: { serviceCode: slug } });
    if (finalExisting) return finalExisting;

    return await tx.service.create({
      data: {
        serviceCode: slug,
        serviceName: serviceIdentifier,
        serviceType: 'GENERAL',
        status: 'active'
      }
    });
  }

  private async resolveProduct(productIdentifier: string, serviceId: string, tx: any) {
    if (!productIdentifier) return null;

    // 1. Try as UUID
    let product = await tx.product.findUnique({
      where: { id: productIdentifier },
    });
    if (product) return product;

    // 2. Try by exact name or code
    product = await tx.product.findFirst({
      where: {
        OR: [
          { productName: { equals: productIdentifier, mode: 'insensitive' } },
          { productCode: { equals: productIdentifier, mode: 'insensitive' } },
        ],
        status: 'active',
      },
    });
    if (product) return product;

    // 3. Create new product
    const productCode = productIdentifier.toUpperCase().replace(/\s+/g, '_').substring(0, 20);
    const existingByCode = await tx.product.findUnique({ where: { productCode } });
    if (existingByCode) return existingByCode;

    return await tx.product.create({
      data: {
        productCode,
        productName: productIdentifier,
        serviceId: serviceId,
        status: 'active'
      }
    });
  }

  private async resolveCity(cityIdentifier: string, tx: any) {
    if (!cityIdentifier) return null;

    // 1. Try as UUID
    let city = await tx.city.findUnique({
      where: { id: cityIdentifier },
    });
    if (city) return city;

    // 2. Extract code/name
    let cityCode = cityIdentifier;
    let cityName = cityIdentifier;
    if (cityIdentifier.includes(' - ')) {
      const parts = cityIdentifier.split(' - ');
      cityCode = parts[0].trim();
      cityName = parts[1].trim();
    } else {
      cityCode = cityIdentifier.substring(0, 3).toUpperCase();
    }

    // 3. Try exact code match
    city = await tx.city.findFirst({
      where: { cityCode: { equals: cityCode, mode: 'insensitive' }, status: 'active' },
    });

    if (city) {
      if (cityIdentifier.includes(' - ') && city.cityName.toLowerCase() !== cityName.toLowerCase()) {
        const cityByName = await tx.city.findFirst({
          where: { cityName: { equals: cityName, mode: 'insensitive' }, status: 'active' },
        });
        if (cityByName) return cityByName;
      } else {
        return city;
      }
    }

    // 4. Try exact name match
    city = await tx.city.findFirst({
      where: { cityName: { equals: cityName || cityIdentifier, mode: 'insensitive' }, status: 'active' },
    });
    if (city) return city;

    // 5. Create new city
    const existingByFinalCode = await tx.city.findUnique({ where: { cityCode } });
    if (existingByFinalCode) return existingByFinalCode;

    return await tx.city.create({
      data: {
        cityCode,
        cityName: cityName || cityIdentifier,
        status: 'active'
      }
    });
  }

  private async findProductByName(productName: string, prismaClient: any = this.prisma) {
    return this.resolveProduct(productName, null, prismaClient);
  }

  private async findServiceByName(serviceName: string, prismaClient: any = this.prisma) {
    return this.resolveService(serviceName, prismaClient);
  }

  private async findCityByCode(cityCode: string, prismaClient: any = this.prisma) {
    return this.resolveCity(cityCode, prismaClient);
  }

  /**
   * Create a new consignment/booking
   * Supports both admin (walk-in customer) and user (self-booking) scenarios
   */
  async createConsignment(
    createConsignmentDto: CreateConsignmentDto,
    createdBy: string,
    userRole: string,
    files?: Array<Express.Multer.File>,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // Get user info to determine if admin or regular user
      const user = await tx.user.findUnique({
        where: { id: createdBy },
        select: { id: true, role: true, email: true, username: true },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${createdBy} not found`);
      }

      const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

      // Resolve dependencies
      const service = await this.resolveService(createConsignmentDto.serviceId, tx);
      const product = await this.resolveProduct(createConsignmentDto.productId, service?.id, tx);
      const originCity = await this.resolveCity(createConsignmentDto.originCityId, tx);
      const destinationCity = await this.resolveCity(createConsignmentDto.destinationCityId, tx);

      // Find or create customer (shipper) using transaction client
      // For admin: create/find walk-in customer
      // For user: find/create customer linked to their account
      const customer = await this.findOrCreateCustomerWithTx(
        {
          mobileNumber: createConsignmentDto.mobileNumber,
          fullName: createConsignmentDto.fullName,
          companyName: createConsignmentDto.companyName,
          address: createConsignmentDto.address,
          address2: createConsignmentDto.address2,
          landlineNumber: createConsignmentDto.landlineNumber,
          emailAddress: createConsignmentDto.emailAddress || (isAdmin ? null : user.email),
          cnicNumber: createConsignmentDto.cnicNumber,
          originCityId: originCity.id,
        },
        createdBy,
        userRole,
        tx,
      );

      // Generate CN number automatically for all bookings (admin and customer)
      let cnNumber = createConsignmentDto.cnNumber;
      // Auto-approve all bookings (both admin and customer)
      const finalStatus = BookingStatus.BOOKED;

      if (!cnNumber) {
        // Auto-generate CN number for all bookings
        cnNumber = await CnGenerator.generate(tx);
      } else {
        // Check if CN number already exists
        const existingBooking = await tx.booking.findUnique({
          where: { cnNumber },
        });
        if (existingBooking) {
          throw new BadRequestException(`CN number ${cnNumber} already exists`);
        }
      }

      // Upload documents if provided
      let documentUrls: string[] = [];
      let documentDetails: any = null;

      if (files && files.length > 0) {
        // Map files to document structure
        const documentsToUpload = files.map((file, index) => {
          const docInfo = createConsignmentDto.documents?.[index] || {
            name: file.originalname,
            price: 0,
          };
          return {
            buffer: file.buffer,
            filename: file.originalname,
            name: docInfo.name,
            price: docInfo.price,
          };
        });

        const uploadedDocs = await this.uploadDocuments(documentsToUpload);
        documentUrls = uploadedDocs.map((doc) => doc.url);
        documentDetails = {
          serviceType: createConsignmentDto.documentServiceType || 'GENERAL',
          documents: uploadedDocs,
        };
      } else if (createConsignmentDto.documents && createConsignmentDto.documents.length > 0) {
        // Documents provided but no files (URLs already provided)
        documentUrls = createConsignmentDto.documents
          .filter((doc) => doc.url)
          .map((doc) => doc.url);
        documentDetails = {
          serviceType: createConsignmentDto.documentServiceType || 'GENERAL',
          documents: createConsignmentDto.documents,
        };
      }

      // Calculate chargeable weight (use volumetric weight if higher)
      const volumetricWeight = createConsignmentDto.volumetricWeight || 0;
      const chargeableWeight =
        volumetricWeight > createConsignmentDto.weight
          ? volumetricWeight
          : createConsignmentDto.weight;

      // 5. Handle Batch - Auto-assign for both admin and customer (USER) bookings
      let batchId = createConsignmentDto.batchId;
      let batchCode = createConsignmentDto.batchCode;

      if (!batchId) {
        // Ensure active batch for user (admin: from config; USER: username-YYYYMMDD-N)
        const activeBatch = await this.batchesService.ensureActiveBatch(createdBy, tx);
        batchId = activeBatch.id;
        batchCode = activeBatch.batchCode;
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          cnNumber,
          bookingDate: new Date(),
          customerId: customer.id,
          originCityId: originCity.id,
          destinationCityId: destinationCity.id,
          serviceId: service.id,
          productId: product.id,
          consigneeName: createConsignmentDto.consigneeFullName,
          consigneePhone: createConsignmentDto.consigneeMobileNumber,
          consigneeEmail: createConsignmentDto.consigneeEmailAddress,
          consigneeAddress: createConsignmentDto.consigneeAddress,
          consigneeAddress2: createConsignmentDto.consigneeAddress2,
          consigneeLandline: createConsignmentDto.consigneeLandlineNumber,
          consigneeZipCode: createConsignmentDto.consigneeZipCode,
          consigneeCompanyName: createConsignmentDto.consigneeCompanyName,
          shipperName: createConsignmentDto.fullName,
          shipperPhone: createConsignmentDto.mobileNumber,
          shipperEmail: createConsignmentDto.emailAddress,
          shipperAddress: createConsignmentDto.address,
          shipperAddress2: createConsignmentDto.address2,
          shipperLandline: createConsignmentDto.landlineNumber,
          shipperCompanyName: createConsignmentDto.companyName,
          shipperCnic: createConsignmentDto.cnicNumber,
          weight: createConsignmentDto.weight,
          pieces: createConsignmentDto.pieces,
          chargeableWeight,
          volumetricWeight: createConsignmentDto.volumetricWeight,
          declaredValue: createConsignmentDto.declaredValue,
          packetContent: createConsignmentDto.packetContent,
          handlingInstructions: createConsignmentDto.handlingInstructions,
          paymentMode: (createConsignmentDto.payMode as string) === 'PREPAID' ? PaymentMode.CASH :
            (createConsignmentDto.payMode as string) === 'TOPAY' ? PaymentMode.ONLINE :
              createConsignmentDto.payMode,
          codAmount: createConsignmentDto.codAmount,
          rate: createConsignmentDto.rate || 0,
          otherAmount: createConsignmentDto.otherAmount || 0,
          totalAmount: createConsignmentDto.totalAmount || 0,
          documentUrls: documentUrls.length > 0 ? JSON.stringify(documentUrls) : null,
          documentDetails: documentDetails ? JSON.stringify(documentDetails) : null,
          status: finalStatus,
          createdBy,
          batchId,
          batchCode,
          preferredDeliveryDate: createConsignmentDto.preferredDeliveryDate
            ? new Date(createConsignmentDto.preferredDeliveryDate)
            : undefined,
          preferredDeliveryTime: createConsignmentDto.preferredDeliveryTime ?? undefined,
          dcReferenceNo: createConsignmentDto.dcReferenceNo ?? undefined,
        },
        include: {
          customer: true,
          originCity: true,
          destinationCity: true,
          service: true,
          product: true,
          createdByUser: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });

      // If CN was provided (e.g. from COD next-cn-cod), clear the reservation
      if (createConsignmentDto.cnNumber) {
        await tx.$executeRaw(
          Prisma.sql`DELETE FROM cn_reservations WHERE cn_number = ${createConsignmentDto.cnNumber}`,
        );
      }

      // Create booking history entry
      await tx.bookingHistory.create({
        data: {
          bookingId: booking.id,
          action: 'CREATED',
          newStatus: finalStatus,
          performedBy: createdBy,
          remarks: isAdmin ? 'Booking created via admin panel' : 'Booking created and auto-approved by customer',
        },
      });

      return booking;
    }, {
      maxWait: 10000, // default: 2000
      timeout: 20000, // default: 5000
    });
  }

  /**
   * Get all consignments with filters
   */
  async findAll(user: any, filters?: {
    status?: BookingStatus;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    cnNumber?: string;
    batchId?: string;
  }) {
    const where: any = {};

    // Only filter by creator if the user is a regular USER
    // Admins and Super Admins can see all bookings
    if (user.role === 'USER') {
      where.createdBy = user.id;
    }

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters?.batchId) {
      where.batchId = filters.batchId;
    }
    if (filters?.cnNumber) {
      where.cnNumber = { contains: filters.cnNumber, mode: 'insensitive' };
    }
    if (filters?.startDate || filters?.endDate) {
      where.bookingDate = {};
      if (filters.startDate) {
        where.bookingDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.bookingDate.lte = filters.endDate;
      }
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        customer: true,
        originCity: true,
        destinationCity: true,
        service: true,
        product: true,
        createdByUser: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get all CNs for a specific user (for tracking dropdown)
   */
  async getMyCns(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { createdBy: userId },
      select: {
        cnNumber: true,
        status: true,
        destinationCity: {
          select: { cityName: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return bookings.map(b => ({
      cnNumber: b.cnNumber,
      status: b.status,
      destinationCity: b.destinationCity?.cityName || 'Unknown'
    }));
  }

  /**
   * Get consignment by CN number (for tracking - includes manifest, deliverySheet, full history)
   */
  async findByCnNumber(cnNumber: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { cnNumber },
      include: {
        customer: true,
        originCity: true,
        destinationCity: true,
        service: true,
        product: true,
        manifest: {
          select: {
            manifestCode: true,
            manifestDate: true,
          },
        },
        deliverySheet: {
          select: {
            sheetNumber: true,
            sheetDate: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        bookingHistory: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            performedByUser: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        pickupRequests: {
          select: {
            riderName: true,
            riderPhone: true,
            status: true,
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with CN number ${cnNumber} not found`);
    }

    return booking;
  }

  /**
   * Void a consignment by CN number
   */
  async voidConsignment(cnNumber: string, reason: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { cnNumber },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with CN ${cnNumber} not found`);
    }

    if (booking.status === BookingStatus.VOIDED) {
      throw new BadRequestException(`Booking with CN ${cnNumber} is already voided`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Create void record
      await tx.voidRecord.create({
        data: {
          cnNumber,
          voidReason: reason,
          voidedBy: userId,
        },
      });

      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.VOIDED },
      });

      // Log to history
      await tx.bookingHistory.create({
        data: {
          bookingId: booking.id,
          action: 'VOIDED',
          oldStatus: booking.status,
          newStatus: BookingStatus.VOIDED,
          remarks: `Booking voided. Reason: ${reason}`,
          performedBy: userId,
        },
      });

      return updatedBooking;
    });
  }

  async getDailySummary(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        createdBy: userId, // Filter by creator
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        customer: true,
        destinationCity: true,
        service: true,
        product: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Exclude voided bookings from all summary totals (cash, revenue, weight, etc.)
    const activeBookings = bookings.filter((b) => b.status !== BookingStatus.VOIDED);
    const summary = {
      totalBookings: activeBookings.length,
      totalRevenue: activeBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0),
      totalWeight: activeBookings.reduce((sum, b) => sum + Number(b.weight), 0),
      totalPackages: activeBookings.reduce((sum, b) => sum + b.pieces, 0),
      payModeBreakdown: {
        CASH: activeBookings.filter(b => b.paymentMode === PaymentMode.CASH).length,
        COD: activeBookings.filter(b => b.paymentMode === PaymentMode.COD).length,
        ONLINE: activeBookings.filter(b => b.paymentMode === PaymentMode.ONLINE).length,
      },
      revenueBreakdown: {
        CASH: activeBookings.filter(b => b.paymentMode === PaymentMode.CASH).reduce((sum, b) => sum + Number(b.totalAmount), 0),
        COD: activeBookings.filter(b => b.paymentMode === PaymentMode.COD).reduce((sum, b) => sum + Number(b.totalAmount), 0),
        ONLINE: activeBookings.filter(b => b.paymentMode === PaymentMode.ONLINE).reduce((sum, b) => sum + Number(b.totalAmount), 0),
      }
    };

    return {
      bookings,
      summary,
    };
  }

  /**
   * Approve a pending consignment
   */
  async approveConsignment(id: string, approveData: { cnNumber?: string; rate?: number; otherAmount?: number; totalAmount?: number; batchId?: string }, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(`Booking is already ${booking.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Generate or validate CN Number
      let cnNumber = approveData.cnNumber;
      if (!cnNumber) {
        cnNumber = await CnGenerator.generate(tx);
      } else {
        const existing = await tx.booking.findUnique({ where: { cnNumber } });
        if (existing && existing.id !== id) {
          throw new BadRequestException(`CN Number ${cnNumber} is already in use`);
        }
      }

      // 2. Handle Batch
      let batchId = approveData.batchId;
      let batchCode = booking.batchCode;

      if (!batchId) {
        const activeBatch = await this.batchesService.ensureActiveBatch(userId, tx);
        batchId = activeBatch.id;
        batchCode = activeBatch.batchCode;
      } else {
        const batch = await tx.batch.findUnique({ where: { id: batchId } });
        if (batch) batchCode = batch.batchCode;
      }

      // 3. Update Booking
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          cnNumber,
          status: BookingStatus.BOOKED,
          rate: approveData.rate !== undefined ? approveData.rate : booking.rate,
          otherAmount: approveData.otherAmount !== undefined ? approveData.otherAmount : booking.otherAmount,
          totalAmount: approveData.totalAmount !== undefined ? approveData.totalAmount : booking.totalAmount,
          batchId,
          batchCode,
        },
      });

      // 4. Log to history
      await tx.bookingHistory.create({
        data: {
          bookingId: id,
          action: 'APPROVED',
          oldStatus: BookingStatus.PENDING,
          newStatus: BookingStatus.BOOKED,
          remarks: `Booking approved and CN ${cnNumber} assigned`,
          performedBy: userId,
        },
      });

      return updatedBooking;
    });
  }

  /**
   * Get a single consignment by ID
   */
  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        originCity: true,
        destinationCity: true,
        product: true,
        service: true,
        bookingHistory: {
          orderBy: { createdAt: 'desc' },
        },
        // pickupRequests: true, // Note: Uncomment after running prisma generate successfully
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  /**
   * Update a consignment
   */
  async update(id: string, updateData: any, userId: string) {
    try {
      const booking = await this.prisma.booking.findUnique({ where: { id } });
      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      // Allow editing if status is PENDING, BOOKED, or PICKUP_REQUESTED
      const editableStatuses: string[] = [BookingStatus.PENDING, BookingStatus.BOOKED, 'PICKUP_REQUESTED'];
      if (!editableStatuses.includes(booking.status)) {
        throw new BadRequestException(`This booking cannot be edited because its status is ${booking.status}`);
      }

      return await this.prisma.$transaction(async (tx) => {
        // Resolve IDs consistently with createConsignment logic

        // Resolve dependencies consistently
        const service = updateData.serviceId ? await this.resolveService(updateData.serviceId, tx) : null;
        const serviceId = service?.id || booking.serviceId;

        const product = updateData.productId ? await this.resolveProduct(updateData.productId, serviceId, tx) : null;
        const productId = product?.id || booking.productId;

        const destinationCity = updateData.destinationCityId ? await this.resolveCity(updateData.destinationCityId, tx) : null;
        const destinationCityId = destinationCity?.id || booking.destinationCityId;

        const originCity = updateData.originCityId ? await this.resolveCity(updateData.originCityId, tx) : null;
        const originCityId = originCity?.id || booking.originCityId;

        // Prepare the update object with cleaned data
        const data: any = {
          // Use relation connect syntax which is more robust for updates in Prisma
          product: productId ? { connect: { id: productId } } : undefined,
          service: serviceId ? { connect: { id: serviceId } } : undefined,
          originCity: originCityId ? { connect: { id: originCityId } } : undefined,
          destinationCity: destinationCityId ? { connect: { id: destinationCityId } } : undefined,

          pieces: updateData.pieces !== undefined ? (updateData.pieces === null ? 1 : parseInt(String(updateData.pieces))) : undefined,
          weight: updateData.weight !== undefined ? (updateData.weight === null ? 0 : parseFloat(String(updateData.weight))) : undefined,
          volumetricWeight: updateData.volumetricWeight !== undefined ? (updateData.volumetricWeight === null ? null : parseFloat(String(updateData.volumetricWeight))) : undefined,
          chargeableWeight: (updateData.weight !== undefined || updateData.volumetricWeight !== undefined) ?
            Math.max(parseFloat(String(updateData.weight || 0)), parseFloat(String(updateData.volumetricWeight || 0))) : undefined,
          packetContent: updateData.packetContent !== undefined ? updateData.packetContent : undefined,
          handlingInstructions: updateData.handlingInstructions !== undefined ? updateData.handlingInstructions : undefined,
          paymentMode: (updateData.payMode ?? updateData.paymentMode) ? (
            (updateData.payMode ?? updateData.paymentMode) === 'PREPAID' ? 'CASH' :
              (updateData.payMode ?? updateData.paymentMode) === 'TOPAY' ? 'ONLINE' :
                (updateData.payMode ?? updateData.paymentMode)
          ) : undefined,
          declaredValue: updateData.declaredValue !== undefined ? (updateData.declaredValue === null ? null : parseFloat(String(updateData.declaredValue))) : undefined,

          // Price fields
          rate: updateData.rate !== undefined ? parseFloat(String(updateData.rate)) : undefined,
          otherAmount: updateData.otherAmount !== undefined ? parseFloat(String(updateData.otherAmount)) : undefined,
          totalAmount: updateData.totalAmount !== undefined ? parseFloat(String(updateData.totalAmount)) : undefined,
          codAmount: updateData.codAmount !== undefined ? (updateData.codAmount === null ? null : parseFloat(String(updateData.codAmount))) : undefined,

          // Shipper fields (accept both form names and API names so Edit Booking and other clients work)
          shipperName: (updateData.shipperName ?? updateData.fullName) !== undefined ? (updateData.shipperName ?? updateData.fullName) : undefined,
          shipperPhone: (updateData.shipperPhone ?? updateData.mobileNumber) !== undefined ? (updateData.shipperPhone ?? updateData.mobileNumber) : undefined,
          shipperCompanyName: (updateData.shipperCompanyName ?? updateData.companyName) !== undefined ? (updateData.shipperCompanyName ?? updateData.companyName) : undefined,
          shipperAddress: (updateData.shipperAddress ?? updateData.address) !== undefined ? (updateData.shipperAddress ?? updateData.address) : undefined,
          shipperAddress2: (updateData.shipperAddress2 ?? updateData.address2) !== undefined ? (updateData.shipperAddress2 ?? updateData.address2) : undefined,
          shipperLandline: (updateData.shipperLandline ?? updateData.landlineNumber) !== undefined ? (updateData.shipperLandline ?? updateData.landlineNumber) : undefined,
          shipperEmail: (updateData.shipperEmail ?? updateData.emailAddress) !== undefined ? (updateData.shipperEmail ?? updateData.emailAddress) : undefined,
          shipperCnic: (updateData.shipperCnic ?? updateData.cnicNumber) !== undefined ? (updateData.shipperCnic ?? updateData.cnicNumber) : undefined,

          // Consignee fields (accept both form names and API names)
          consigneeName: (updateData.consigneeName ?? updateData.consigneeFullName) !== undefined ? (updateData.consigneeName ?? updateData.consigneeFullName) : undefined,
          consigneePhone: (updateData.consigneePhone ?? updateData.consigneeMobileNumber) !== undefined ? (updateData.consigneePhone ?? updateData.consigneeMobileNumber) : undefined,
          consigneeCompanyName: updateData.consigneeCompanyName !== undefined ? updateData.consigneeCompanyName : undefined,
          consigneeAddress: updateData.consigneeAddress !== undefined ? updateData.consigneeAddress : undefined,
          consigneeAddress2: updateData.consigneeAddress2 !== undefined ? updateData.consigneeAddress2 : undefined,
          consigneeLandline: (updateData.consigneeLandline ?? updateData.consigneeLandlineNumber) !== undefined ? (updateData.consigneeLandline ?? updateData.consigneeLandlineNumber) : undefined,
          consigneeEmail: (updateData.consigneeEmail ?? updateData.consigneeEmailAddress) !== undefined ? (updateData.consigneeEmail ?? updateData.consigneeEmailAddress) : undefined,
          consigneeZipCode: updateData.consigneeZipCode !== undefined ? updateData.consigneeZipCode : undefined,

          preferredDeliveryDate: updateData.preferredDeliveryDate !== undefined
            ? (updateData.preferredDeliveryDate ? new Date(updateData.preferredDeliveryDate) : null)
            : undefined,
          preferredDeliveryTime: updateData.preferredDeliveryTime !== undefined ? updateData.preferredDeliveryTime : undefined,
          dcReferenceNo: updateData.dcReferenceNo !== undefined ? (updateData.dcReferenceNo || null) : undefined,
        };

        const updated = await tx.booking.update({
          where: { id },
          data,
          include: {
            service: true,
            product: true,
            originCity: true,
            destinationCity: true,
            customer: true,
          }
        });

        await tx.bookingHistory.create({
          data: {
            bookingId: id,
            action: 'UPDATED',
            oldStatus: booking.status,
            newStatus: updated.status,
            remarks: 'Booking details updated by user',
            performedBy: userId,
          },
        });

        return updated;
      });
    } catch (error) {
      console.error('Error updating consignment:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to update booking: ${error.message}`);
    }
  }

  /**
   * Cancel a consignment
   */
  async cancel(id: string, reason: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Only pending bookings can be cancelled by the user usually
    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.BOOKED) {
      throw new BadRequestException('Only pending or booked shipments can be cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: { status: BookingStatus.VOIDED },
      });

      await tx.bookingHistory.create({
        data: {
          bookingId: id,
          action: 'CANCELLED',
          oldStatus: booking.status,
          newStatus: BookingStatus.VOIDED,
          remarks: reason || 'Shipment cancelled by user',
          performedBy: userId,
        },
      });

      return updated;
    });
  }

  /**
   * Update consignment status (for shipment tracking - admin override)
   */
  async updateStatus(id: string, newStatus: string, remarks: string | undefined, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    if (booking.status === BookingStatus.VOIDED) {
      throw new BadRequestException('Cannot update status of voided booking');
    }
    const validStatuses = Object.values(BookingStatus).filter((s) => s !== BookingStatus.VOIDED) as string[];
    if (!validStatuses.includes(newStatus)) {
      throw new BadRequestException(`Invalid status: ${newStatus}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: { status: newStatus as BookingStatus },
      });

      await tx.bookingHistory.create({
        data: {
          bookingId: id,
          action: 'STATUS_UPDATE',
          oldStatus: booking.status,
          newStatus: newStatus as BookingStatus,
          remarks: remarks || `Status updated to ${newStatus}`,
          performedBy: userId,
        },
      });

      return updated;
    });
  }

  /**
   * Add remarks to consignment (for shipment tracking)
   */
  async addRemarks(id: string, remarks: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    await this.prisma.bookingHistory.create({
      data: {
        bookingId: id,
        action: 'REMARKS',
        oldStatus: booking.status,
        newStatus: booking.status,
        remarks,
        performedBy: userId,
      },
    });

    return this.findByCnNumber(booking.cnNumber!);
  }

  /**
   * Get next CN for COD in 10-digit format: YYYYMMDDNN (no CN prefix or dashes).
   * Reserves the CN so it is not issued to another booking until this one is created or reservation expires.
   */
  async getNextCnForCod(userId: string): Promise<{ cnNumber: string }> {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}${monthStr}${dayStr}`;
      const prefixLike = `${dateStr}%`;

      const todayStart = new Date(year, month, day, 0, 0, 0, 0);
      const todayEnd = new Date(year, month, day, 23, 59, 59, 999);

      const bookingsToday = await tx.booking.count({
        where: {
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      });

      type CountResult = [{ count: bigint }];
      const reservationsResult = (await tx.$queryRaw(
        Prisma.sql`SELECT COUNT(*)::int as count FROM cn_reservations WHERE cn_number LIKE ${prefixLike}`,
      )) as CountResult;
      const reservationsToday = Number(reservationsResult[0]?.count ?? 0);

      const sequence = bookingsToday + reservationsToday + 1;
      const cnNumber = `${dateStr}${String(sequence).padStart(2, '0')}`;

      const existsBooking = await tx.booking.findUnique({ where: { cnNumber } });
      type ExistsRow = [{ exists: boolean }];
      const existsReservationResult = (await tx.$queryRaw(
        Prisma.sql`SELECT EXISTS(SELECT 1 FROM cn_reservations WHERE cn_number = ${cnNumber}) as exists`,
      )) as ExistsRow;
      const existsReservation = existsReservationResult[0]?.exists ?? false;
      if (existsBooking || existsReservation) {
        throw new BadRequestException('Failed to generate unique COD CN. Please try again.');
      }

      const id = randomUUID();
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO cn_reservations (id, cn_number, user_id, created_at)
        VALUES (${id}, ${cnNumber}, ${userId}, ${now})`,
      );
      return { cnNumber };
    });
  }
}
