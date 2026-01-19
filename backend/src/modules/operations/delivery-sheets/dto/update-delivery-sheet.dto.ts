import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliverySheetDto } from './create-delivery-sheet.dto';

export class UpdateDeliverySheetDto extends PartialType(CreateDeliverySheetDto) { }
