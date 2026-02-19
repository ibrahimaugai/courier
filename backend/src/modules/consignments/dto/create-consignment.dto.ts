import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsEmail,
  Min,
} from 'class-validator';
import { Type, Transform, Expose } from 'class-transformer';
import { PaymentMode } from '@prisma/client';

export class DocumentDto {
  @ApiProperty({ example: 'Nikah Nama' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 5000 })
  @Expose()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'https://cloudinary.com/image.jpg', required: false })
  @Expose()
  @IsOptional()
  @IsString()
  url?: string;
}

export class CreateConsignmentDto {
  // Product & Service
  @ApiProperty({ example: 'product-uuid' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'service-uuid' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ example: 'city-uuid' })
  @IsString()
  @IsNotEmpty()
  destinationCityId: string;

  @ApiProperty({ example: 'city-uuid' })
  @IsString()
  @IsNotEmpty()
  originCityId: string;

  // CN Number (optional - will be auto-generated if not provided)
  @ApiProperty({ example: 'CN-20251231-000001', required: false })
  @IsOptional()
  @IsString()
  cnNumber?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  pieces: number;

  @ApiProperty({ example: 'Handle with care', required: false })
  @IsOptional()
  @IsString()
  handlingInstructions?: string;

  @ApiProperty({ example: '2026-02-20', description: 'Preferred delivery date (YYYY-MM-DD) for On Time Service', required: false })
  @IsOptional()
  @IsString()
  preferredDeliveryDate?: string;

  @ApiProperty({ example: '14:00', description: 'Preferred delivery time for On Time Service', required: false })
  @IsOptional()
  @IsString()
  preferredDeliveryTime?: string;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  packetContent: string;

  @ApiProperty({ example: 'CASH', enum: PaymentMode })
  @IsEnum(PaymentMode)
  payMode: PaymentMode;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volumetricWeight?: number;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0)
  weight: number;

  // Shipper Information
  @ApiProperty({ example: '03001234567' })
  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'ABC Company', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ example: '123 Main Street, City' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Near Park', required: false })
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiProperty({ example: '0421234567', required: false })
  @IsOptional()
  @IsString()
  landlineNumber?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  emailAddress?: string;

  @ApiProperty({ example: '12345-1234567-1', required: false })
  @IsOptional()
  @IsString()
  cnicNumber?: string;

  // Consignee Information
  @ApiProperty({ example: '03009876543' })
  @IsString()
  @IsNotEmpty()
  consigneeMobileNumber: string;

  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  consigneeFullName: string;

  @ApiProperty({ example: 'XYZ Company', required: false })
  @IsOptional()
  @IsString()
  consigneeCompanyName?: string;

  @ApiProperty({ example: '456 Park Avenue, City' })
  @IsString()
  @IsNotEmpty()
  consigneeAddress: string;

  @ApiProperty({ example: 'Building 2', required: false })
  @IsOptional()
  @IsString()
  consigneeAddress2?: string;

  @ApiProperty({ example: '0429876543', required: false })
  @IsOptional()
  @IsString()
  consigneeLandlineNumber?: string;

  @ApiProperty({ example: 'jane@example.com', required: false })
  @IsOptional()
  @IsEmail()
  consigneeEmailAddress?: string;

  @ApiProperty({ example: '54000', required: false })
  @IsOptional()
  @IsString()
  consigneeZipCode?: string;

  // Pricing
  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  otherAmount?: number;

  @ApiProperty({ example: 1500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  codAmount?: number;

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  declaredValue?: number;

  // Documents
  @ApiProperty({ type: [DocumentDto], required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents?: DocumentDto[];

  @ApiProperty({ example: 'MOFA', required: false })
  @IsOptional()
  @IsString()
  documentServiceType?: string; // MOFA, Apostille, UAE Embassy, etc.

  @ApiProperty({ example: 'batch-uuid', required: false })
  @IsOptional()
  @IsString()
  batchId?: string;

  @ApiProperty({ example: 'STF001-20240101-1', required: false })
  @IsOptional()
  @IsString()
  batchCode?: string;
}


