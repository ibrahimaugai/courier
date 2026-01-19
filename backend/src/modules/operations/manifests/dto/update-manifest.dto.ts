import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateManifestDto {
    @ApiProperty({ example: ['14201900003', '14201900004'], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    cnNumbers?: string[];

    @ApiProperty({ example: 'John Doe', required: false })
    @IsString()
    @IsOptional()
    driverName?: string;

    @ApiProperty({ example: 'SEAL456', required: false })
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
}
