import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateArrivalScanDto {
    @ApiProperty({ example: ['14201900003', '14201900004'] })
    @IsArray()
    @IsString({ each: true })
    cnNumbers: string[];

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsOptional()
    riderName?: string;
}
