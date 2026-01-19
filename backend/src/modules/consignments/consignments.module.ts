import { Module } from '@nestjs/common';
import { ConsignmentsController } from './consignments.controller';
import { ConsignmentsService } from './consignments.service';
import { DatabaseModule } from '../database/database.module';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { BatchesModule } from '../batches/batches.module';

@Module({
  imports: [DatabaseModule, BatchesModule],
  controllers: [ConsignmentsController],
  providers: [ConsignmentsService, CloudinaryService],
  exports: [ConsignmentsService],
})
export class ConsignmentsModule { }


