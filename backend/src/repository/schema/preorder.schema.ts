import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SimpleDriver {
  @Prop({ required: true })
  id: number;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  value: number;
}

export const SimpleDriverSchema = SchemaFactory.createForClass(SimpleDriver);

@Schema()
export class PreOrder extends Document {
  @Prop({ required: true })
  origin: string;
  @Prop({ required: true })
  destination: string;
  @Prop({ required: true })
  distance: number;
  @Prop({ required: true })
  duration: string;
  @Prop({ type: [SimpleDriverSchema], required: true })
  driver: SimpleDriver[];
}

export type SimpleDriverType = {
  id: number;
  name: string;
  value: number;
};

export type PreOrderType = {
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  driver: SimpleDriverType[];
};

export const PreOrderSchema = SchemaFactory.createForClass(PreOrder);
