import { Module } from '@nestjs/common';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { DatabaseModule } from '../database/database.module';
import { BatchesModule } from '../batches/batches.module';

@Module({
    imports: [DatabaseModule, BatchesModule],
    controllers: [ConfigurationController],
    providers: [ConfigurationService],
    exports: [ConfigurationService],
})
export class ConfigurationModule { }
