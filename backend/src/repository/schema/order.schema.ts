import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderType = {
  customer_id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  driver: {
    id: number;
    name: string;
  };
  value: number;
};

@Schema()
class Driver extends Document {
  @Prop({ required: true })
  id: number;
  @Prop({ required: true })
  name: string;
}

const DriverSchema = SchemaFactory.createForClass(Driver);

@Schema()
export class Order extends Document {
  @Prop({ required: true })
  id: number;
  @Prop({ required: true })
  customer_id: string;
  @Prop({ required: true })
  origin: string;
  @Prop({ required: true })
  destination: string;
  @Prop({ required: true })
  distance: number;
  @Prop({ required: true })
  duration: string;
  @Prop({ type: DriverSchema, required: true })
  driver: Driver;
  @Prop({ required: true })
  date: Date;
  @Prop({ required: true })
  value: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
