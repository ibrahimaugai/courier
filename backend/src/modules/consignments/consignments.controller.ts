import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
  Patch,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ConsignmentsService } from './consignments.service';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BookingStatus } from '@prisma/client';

@ApiTags('Consignments')
@Controller('consignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConsignmentsController {
  constructor(private readonly consignmentsService: ConsignmentsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new consignment/booking' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('documents', 20)) // Allow up to 20 files
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'productId',
        'serviceId',
        'destinationCityId',
        'originCityId',
        'pieces',
        'packetContent',
        'payMode',
        'weight',
        'mobileNumber',
        'fullName',
        'address',
        'consigneeMobileNumber',
        'consigneeFullName',
        'consigneeAddress',
        'rate',
        'totalAmount',
      ],
      properties: {
        productId: { type: 'string' },
        serviceId: { type: 'string' },
        destinationCityId: { type: 'string' },
        originCityId: { type: 'string' },
        cnNumber: { type: 'string' },
        pieces: { type: 'number' },
        handlingInstructions: { type: 'string' },
        packetContent: { type: 'string' },
        payMode: { type: 'string', enum: ['PREPAID', 'COD', 'TOPAY'] },
        volumetricWeight: { type: 'number' },
        weight: { type: 'number' },
        mobileNumber: { type: 'string' },
        fullName: { type: 'string' },
        companyName: { type: 'string' },
        address: { type: 'string' },
        address2: { type: 'string' },
        landlineNumber: { type: 'string' },
        emailAddress: { type: 'string' },
        cnicNumber: { type: 'string' },
        consigneeMobileNumber: { type: 'string' },
        consigneeFullName: { type: 'string' },
        consigneeCompanyName: { type: 'string' },
        consigneeAddress: { type: 'string' },
        consigneeAddress2: { type: 'string' },
        consigneeLandlineNumber: { type: 'string' },
        consigneeEmailAddress: { type: 'string' },
        consigneeZipCode: { type: 'string' },
        rate: { type: 'number' },
        otherAmount: { type: 'number' },
        totalAmount: { type: 'number' },
        codAmount: { type: 'number' },
        declaredValue: { type: 'number' },
        documentServiceType: { type: 'string' },
        documents: {
          type: 'string',
          description: 'JSON array of document details',
        },
      },
    },
  })
  async create(
    @Body() createConsignmentDto: CreateConsignmentDto,
    @Request() req,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB max
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|doc|docx)$/ }),
        ],
      }),
    )
    files?: Array<Express.Multer.File>,
  ) {
    // Documents are parsed by DTO Transform decorator

    return this.consignmentsService.createConsignment(
      createConsignmentDto,
      req.user.id,
      req.user.role,
      files,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all consignments with optional filters' })
  async findAll(
    @Request() req,
    @Query('status') status?: BookingStatus,
    @Query('customerId') customerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cnNumber') cnNumber?: string,
    @Query('batchId') batchId?: string,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (customerId) filters.customerId = customerId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (cnNumber) filters.cnNumber = cnNumber;
    if (batchId) filters.batchId = batchId;

    return this.consignmentsService.findAll(req.user, filters);
  }

  @Get('daily-summary')
  @ApiOperation({ summary: 'Get daily summary and bookings' })
  async getDailySummary(@Request() req, @Query('date') date: string) {
    return this.consignmentsService.getDailySummary(req.user.id, date);
  }

  @Get('my-cns')
  @ApiOperation({ summary: 'Get all CNs for the current user' })
  async getMyCns(@Request() req) {
    return this.consignmentsService.getMyCns(req.user.id);
  }

  @Get('track/:cnNumber')
  @ApiOperation({ summary: 'Track consignment by CN number' })
  async findByCnNumber(@Param('cnNumber') cnNumber: string) {
    return this.consignmentsService.findByCnNumber(cnNumber);
  }

  @Post('void/:cnNumber')
  @ApiOperation({ summary: 'Void a consignment by CN number' })
  async voidConsignment(
    @Param('cnNumber') cnNumber: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.consignmentsService.voidConsignment(cnNumber, reason, req.user.id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a pending booking' })
  async approve(
    @Param('id') id: string,
    @Body() approveData: { cnNumber?: string; rate?: number; otherAmount?: number; totalAmount?: number; batchId?: string },
    @Request() req,
  ) {
    return this.consignmentsService.approveConsignment(id, approveData, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single consignment by ID' })
  async findOne(@Param('id') id: string) {
    return this.consignmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a consignment' })
  async update(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req,
  ) {
    return this.consignmentsService.update(id, updateData, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a consignment' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.consignmentsService.cancel(id, reason, req.user.id);
  }
}

