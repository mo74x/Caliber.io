import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Candidate } from '../../candidates/schemas/candidate.schema';

@Schema({ timestamps: true })
export class Bookmark extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recruiter: User;

  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidate: Candidate;
}

// Ensure a recruiter can't bookmark the same person twice
export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);
BookmarkSchema.index({ recruiter: 1, candidate: 1 }, { unique: true });
