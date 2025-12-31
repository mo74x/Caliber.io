import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class Candidate extends Document {
  // Link this profile to the User (Auth) ID
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: User;

  @Prop({ required: true })
  jobTitle: string; // "Senior Backend Developer"

  @Prop({ type: [String], index: true })
  skills: string[]; // ["NestJS", "MongoDB", "React"]

  @Prop({ required: true })
  experienceYears: number;

  @Prop({ required: true })
  minSalary: number; // 25000

  @Prop({ default: 'Immediate' })
  noticePeriod: string; // "1 Month"

  @Prop({ default: true })
  isVisible: boolean; // the "Freshness" toggle
  @Prop({ default: Date.now })
  lastActiveAt: Date;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
