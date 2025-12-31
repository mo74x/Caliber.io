import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Candidate extends Document {
  // Link this profile to the User (Auth) ID
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  @ApiProperty({
    example: '67c2b3d1e4b3d1e4b3d1e4b3',
    description: 'The ID of the user',
  })
  user: User;

  @Prop({ required: true })
  @ApiProperty({
    example: 'Senior Backend Developer',
    description: 'The job title of the candidate',
  })
  jobTitle: string; // "Senior Backend Developer"

  @Prop({ type: [String], index: true })
  skills: string[]; // ["NestJS", "MongoDB", "React"]

  @Prop({ required: true })
  @ApiProperty({
    example: 5,
    description: 'The years of experience of the candidate',
  })
  experienceYears: number;

  @Prop({ required: true })
  @ApiProperty({
    example: 25000,
    description: 'The minimum salary of the candidate',
  })
  minSalary: number; // 25000

  @Prop({ default: 'Immediate' })
  @ApiProperty({
    example: 'Immediate',
    description: 'The notice period of the candidate',
  })
  noticePeriod: string; // "1 Month"

  @Prop({ default: true })
  @ApiProperty({
    example: true,
    description: 'The visibility of the candidate',
  })
  isVisible: boolean; // the "Freshness" toggle
  @Prop({ default: Date.now })
  lastActiveAt: Date;

  // --- PRIVATE INFO (To be Locked) ---
  @Prop({ required: true })
  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the candidate',
  })
  fullName: string;

  @Prop({ required: true })
  @ApiProperty({
    example: '123456789',
    description: 'The phone number of the candidate',
  })
  phone: string;

  @Prop()
  @ApiProperty({
    example: 'https://example.com/cv.pdf',
    description: 'The CV of the candidate',
  })
  cvUrl: string; // Link to their PDF

  @Prop()
  @ApiProperty({
    example: 'https://linkedin.com/in/johndoe',
    description: 'The LinkedIn profile of the candidate',
  })
  linkedinUrl: string;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
