import { Injectable } from '@nestjs/common';
import { Driver } from './schema/driver.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PreOrder, PreOrderType } from './schema/preorder.schema';

type FindPreOrderQuery = {
  origin: string;
  destination: string;
};

@Injectable()
export class MongoTripRepository {
  constructor(
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(PreOrder.name) private preOrderModel: Model<PreOrder>,
  ) {}

  async pickDriver({
    distanceMeters,
  }: {
    distanceMeters: number;
  }): Promise<Driver[]> {
    return this.driverModel
      .find({ minKm: { $lte: distanceMeters / 1000.0 } })
      .sort({ tax: 1 })
      .exec();
  }

  async findDriver(driver: { name: string; id: number }) {
    if (!driver) return null;
    return this.driverModel.findOne({ name: driver.name, id: driver.id });
  }

  async updatePreOrder(preOrder: PreOrderType) {
    return this.preOrderModel.updateOne(
      {
        origin: preOrder.origin,
        destination: preOrder.destination,
      },
      preOrder,
      { upsert: true },
    );
  }

  async findPreOrder({ origin, destination }: FindPreOrderQuery) {
    return this.preOrderModel.findOne({ origin, destination });
  }
}
