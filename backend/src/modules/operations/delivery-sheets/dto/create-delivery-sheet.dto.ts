import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateDeliverySheetDto {
    @IsDateString()
    sheetDate: string;

    @IsString()
    @IsOptional()
    riderId?: string;

    @IsString()
    @IsOptional()
    riderName?: string;

    @IsString()
    @IsOptional()
    riderMobile?: string;

    @IsString()
    @IsOptional()
    routeId?: string;

    @IsString()
    @IsOptional()
    vehicleNo?: string;

    @IsString()
    @IsOptional()
    vehicleSize?: string;

    @IsString()
    @IsOptional()
    vehicleVendor?: string;

    @IsArray()
    @IsString({ each: true })
    cnNumbers: string[];
}
