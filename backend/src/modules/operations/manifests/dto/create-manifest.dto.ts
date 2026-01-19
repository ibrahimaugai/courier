import { IsString, IsArray, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateManifestDto {
  @ApiProperty({ example: 'MAN2024001' })
  @IsString()
  manifestCode: string;

  @ApiProperty({ example: '2024-01-09T00:00:00.000Z' })
  @IsDateString()
  manifestDate: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  driverName?: string;

  @ApiProperty({ example: 'uuid-of-driver', required: false })
  @IsString()
  @IsOptional()
  driverId?: string;

  @ApiProperty({ example: 'uuid-of-vehicle', required: false })
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @ApiProperty({ example: 'SEAL123', required: false })
  @IsString()
  @IsOptional()
  manifestSealNo?: string;

  @ApiProperty({ example: 'Teller Name', required: false })
  @IsString()
  @IsOptional()
  teller?: string;

  @ApiProperty({ example: '03334616162', required: false })
  @IsString()
  @IsOptional()
  staffDriverPhone?: string;

  @ApiProperty({ example: 'LEK-17-1155', required: false })
  @IsString()
  @IsOptional()
  vehicleNo?: string;

  @ApiProperty({ example: '20 Feet', required: false })
  @IsString()
  @IsOptional()
  vehicleSize?: string;

  @ApiProperty({ example: 'PMGT', required: false })
  @IsString()
  @IsOptional()
  vehicleVendor?: string;

  @ApiProperty({ example: 'LHE-KHI', required: false })
  @IsString()
  @IsOptional()
  route?: string;

  @ApiProperty({ example: ['14201900001', '14201900002'] })
  @IsArray()
  @IsString({ each: true })
  cnNumbers: string[];
}
