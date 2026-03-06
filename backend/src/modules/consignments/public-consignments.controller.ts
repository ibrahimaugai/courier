import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConsignmentsService } from './consignments.service';

@ApiTags('Public Consignments')
@Controller('public/consignments')
export class PublicConsignmentsController {
  constructor(private readonly consignmentsService: ConsignmentsService) {}

  @Get('track/:cnNumber')
  @ApiOperation({ summary: 'Public: track consignment by CN number (no auth required)' })
  async publicFindByCnNumber(@Param('cnNumber') cnNumber: string) {
    // Reuse the same service method as the authenticated endpoint
    return this.consignmentsService.findByCnNumber(cnNumber);
  }
}

