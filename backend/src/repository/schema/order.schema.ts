import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
export class Order extends Document {
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
  @Prop({ required: true })
  driver: {
    id: number;
    name: string;
  };
  @Prop({ required: true })
  value: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
