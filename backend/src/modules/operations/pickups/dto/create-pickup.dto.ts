import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePickupDto {
    @ApiProperty({ example: 'uuid-of-booking' })
    @IsUUID()
    @IsNotEmpty()
    bookingId: string;

    @ApiProperty({ example: '123 Main St, Lahore' })
    @IsString()
    @IsNotEmpty()
    pickupAddress: string;

    @ApiProperty({ example: '2024-01-20' })
    @IsDateString()
    @IsNotEmpty()
    pickupDate: string;

    @ApiProperty({ example: '09:00-12:00', required: false })
    @IsString()
    @IsOptional()
    pickupTime?: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    contactName: string;

    @ApiProperty({ example: '03001234567' })
    @IsString()
    @IsNotEmpty()
    contactPhone: string;

    @ApiProperty({ example: 'Call before arrival', required: false })
    @IsString()
    @IsOptional()
    specialInstructions?: string;
}
