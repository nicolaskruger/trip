import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RideController } from './controller/ride.controller';
import { RideService } from './service/ride.service';
import { HttpModule } from '@nestjs/axios';
import { MapsRepository } from './repository/maps.repository';

@Module({
  imports: [HttpModule],
  controllers: [AppController, RideController],
  providers: [AppService, RideService, MapsRepository],
})
export class AppModule {}
