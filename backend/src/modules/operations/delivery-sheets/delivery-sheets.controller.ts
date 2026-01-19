import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { DeliverySheetsService } from './delivery-sheets.service';
import { CreateDeliverySheetDto } from './dto/create-delivery-sheet.dto';
import { UpdateDeliverySheetDto } from './dto/update-delivery-sheet.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('delivery-sheets')
@UseGuards(JwtAuthGuard)
export class DeliverySheetsController {
    constructor(private readonly deliverySheetsService: DeliverySheetsService) { }

    @Post()
    create(@Body() createDto: CreateDeliverySheetDto, @Request() req) {
        return this.deliverySheetsService.create(createDto, req.user.id);
    }

    @Get('routes')
    getRoutes() {
        return this.deliverySheetsService.getRoutes();
    }

    @Get()
    findAll(@Query() query) {
        return this.deliverySheetsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.deliverySheetsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateDeliverySheetDto, @Request() req) {
        return this.deliverySheetsService.update(id, updateDto, req.user.id);
    }

    @Post(':id/complete')
    complete(@Param('id') id: string) {
        return this.deliverySheetsService.complete(id);
    }

    @Delete(':id/shipments/:shipmentId')
    removeShipment(@Param('id') id: string, @Param('shipmentId') shipmentId: string, @Request() req) {
        return this.deliverySheetsService.removeShipment(id, shipmentId, req.user.id);
    }

    // Phase 2 Routes
    @Get('phase2/:sheetNumber')
    getSheetForPhase2(@Param('sheetNumber') sheetNumber: string) {
        return this.deliverySheetsService.getSheetForPhase2(sheetNumber);
    }

    @Patch(':id/shipments/:shipmentId/status')
    updateShipmentStatus(
        @Param('id') sheetId: string,
        @Param('shipmentId') shipmentId: string,
        @Body() updateData: { deliveryStatus?: string; deliveryRemarks?: string; collectedAmount?: number },
        @Request() req
    ) {
        return this.deliverySheetsService.updateShipmentStatus(sheetId, shipmentId, updateData, req.user.id);
    }

    @Post(':id/close')
    closeSheet(@Param('id') id: string, @Request() req) {
        return this.deliverySheetsService.closeSheet(id, req.user.id);
    }
}
