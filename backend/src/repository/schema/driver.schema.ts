import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Review {
  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

@Schema()
export class Driver extends Document {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  vehicle: string;

  @Prop({ type: ReviewSchema, required: true })
  review: Review;

  @Prop({ required: true })
  tax: number;

  @Prop({ required: true })
  minKm: number;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);
