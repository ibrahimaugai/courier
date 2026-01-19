import { IsOptional, IsString, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { DeliveryStatus } from '@prisma/client';

export class UpdateDeliveryShipmentDto {
    @IsOptional()
    @IsEnum(DeliveryStatus)
    deliveryStatus?: DeliveryStatus;

    @IsOptional()
    @IsString()
    deliveryRemarks?: string;

    @IsOptional()
    @IsNumber()
    collectedAmount?: number;

    @IsOptional()
    @IsDateString()
    deliveredAt?: string;
}
