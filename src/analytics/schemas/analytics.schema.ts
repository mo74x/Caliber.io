import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AnalyticsAction {
  VIEW = 'VIEW',
  UNLOCK = 'UNLOCK',
}

@Schema({ timestamps: true })
export class AnalyticsLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recruiter: Types.ObjectId; // Who did it?

  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidate: Types.ObjectId; // Who was it done to?

  @Prop({ enum: AnalyticsAction, required: true })
  action: AnalyticsAction; // What happened?
}

export const AnalyticsLogSchema = SchemaFactory.createForClass(AnalyticsLog);
