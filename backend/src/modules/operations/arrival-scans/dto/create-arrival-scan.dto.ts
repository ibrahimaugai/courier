import { IsString, IsArray, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArrivalScanDto {
    @ApiProperty({ example: 'AR2500053508' })
    @IsString()
    @IsNotEmpty()
    arrivalCode: string;

    @ApiProperty({ example: '2025-01-08T16:04:43Z' })
    @IsString()
    @IsNotEmpty()
    scanDate: string;

    @ApiProperty({ example: 'uuid-of-rider' })
    @IsString()
    @IsOptional()
    riderId?: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsOptional()
    riderName?: string;

    @ApiProperty({ example: ['14201900001', '14201900002'] })
    @IsArray()
    @IsString({ each: true })
    cnNumbers: string[];
}
