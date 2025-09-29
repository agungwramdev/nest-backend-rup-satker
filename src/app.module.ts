import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RupModule } from './rup/rup.module';

@Module({
  imports: [RupModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
