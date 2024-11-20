import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RideController } from './controller/ride.controller';
import { RideService } from './service/ride.service';

@Module({
  imports: [],
  controllers: [AppController, RideController],
  providers: [AppService, RideService],
})
export class AppModule {}
