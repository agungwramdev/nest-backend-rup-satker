import { Module } from '@nestjs/common';
import { RupController } from './rup.controller';
import { RupService } from './rup.service';

@Module({
  controllers: [RupController],
  providers: [RupService]
})
export class RupModule {}
