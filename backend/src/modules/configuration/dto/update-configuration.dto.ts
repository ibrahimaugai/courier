import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConfigurationDto {
    @ApiProperty({ example: 'R-001', required: false })
    @IsOptional()
    @IsString()
    routeCode?: string;

    @ApiProperty({ example: 'S-101', required: false })
    @IsOptional()
    @IsString()
    staffCode?: string;

    @ApiProperty({ example: 'Main Route', required: false })
    @IsOptional()
    @IsString()
    routeName?: string;

    @ApiProperty({ example: 'KHI-001', required: false })
    @IsOptional()
    @IsString()
    stationCode?: string; // We'll accept station CODE from frontend and look up ID

    @ApiProperty({ example: 'HP-LaserJet-1020', required: false })
    @IsOptional()
    @IsString()
    printerConnection?: string;
}
