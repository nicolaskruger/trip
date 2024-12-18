import { Injectable } from '@nestjs/common';
import { Driver } from './schema/driver.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PreOrder, PreOrderType } from './schema/preorder.schema';
import { Order, OrderType } from './schema/order.schema';
import { RidesQuery } from 'src/service/ride.service';

type FindPreOrderQuery = {
  origin: string;
  destination: string;
};

@Injectable()
export class MongoTripRepository {
  constructor(
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(PreOrder.name) private preOrderModel: Model<PreOrder>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
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

  async findDriverById(id: number) {
    return this.driverModel.findOne({ id });
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

  async findOrderByRidesQuery({ customer_id, driver_id }: RidesQuery) {
    if (driver_id)
      return this.orderModel.find({ customer_id, 'driver.id': driver_id });
    return this.orderModel.find({ customer_id });
  }

  async saveOrder(order: OrderType) {
    const [data] = await this.orderModel.find().sort({ id: -1 });
    let id = 1;
    if (data) id = data.id + 1;
    return this.orderModel.create({ ...order, id, date: new Date() });
  }
}
