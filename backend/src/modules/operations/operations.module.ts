import { Module } from '@nestjs/common';
import { ArrivalScansService } from './arrival-scans/arrival-scans.service';
import { ArrivalScansController } from './arrival-scans/arrival-scans.controller';
import { ManifestsService } from './manifests/manifests.service';
import { ManifestsController } from './manifests/manifests.controller';
import { DeliverySheetsService } from './delivery-sheets/delivery-sheets.service';
import { DeliverySheetsController } from './delivery-sheets/delivery-sheets.controller';
import { PickupsService } from './pickups/pickups.service';
import { PickupsController } from './pickups/pickups.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [
        ArrivalScansController,
        ManifestsController,
        DeliverySheetsController,
        PickupsController
    ],
    providers: [
        ArrivalScansService,
        ManifestsService,
        DeliverySheetsService,
        PickupsService
    ],
    exports: [
        ArrivalScansService,
        ManifestsService,
        DeliverySheetsService,
        PickupsService
    ],
})
export class OperationsModule { }
