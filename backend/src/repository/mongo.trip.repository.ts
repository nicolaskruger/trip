import { Injectable } from '@nestjs/common';
import { Driver } from './schema/driver.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MongoTripRepository {
  constructor(@InjectModel(Driver.name) private driverModel: Model<Driver>) {}

  async pick({
    distanceMeters,
  }: {
    distanceMeters: number;
  }): Promise<Driver[]> {
    return this.driverModel
      .find({ minKm: { $lte: distanceMeters / 1000.0 } })
      .sort({ tax: 1 })
      .exec();
  }
}
