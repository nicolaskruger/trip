import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RideController } from './controller/ride.controller';
import { RideService } from './service/ride.service';
import { HttpModule } from '@nestjs/axios';
import { MapsRepository } from './repository/maps.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Driver, DriverSchema } from './repository/schema/driver.schema';
import { MongoTripRepository } from './repository/mongo.trip.repository';
import { PreOrder, PreOrderSchema } from './repository/schema/preorder.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot(
      'mongodb://root:examplepassword@mongodb:27017/trip?authSource=admin',
    ),
    MongooseModule.forFeature([
      { name: Driver.name, schema: DriverSchema },
      { name: PreOrder.name, schema: PreOrderSchema },
    ]),
  ],
  controllers: [AppController, RideController],
  providers: [AppService, RideService, MapsRepository, MongoTripRepository],
})
export class AppModule {}
