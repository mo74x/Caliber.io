import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

// Define the roles available in Calibar
export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  RECRUITER = 'RECRUITER',
  ADMIN = 'ADMIN',
}
// Define the statuses available in Calibar
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

@Schema({ timestamps: true }) // automatically adds createdAt and updatedAt
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  email: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  password: string; // This will be encrypted

  @Prop({ required: true, enum: UserRole, default: UserRole.CANDIDATE })
  @ApiProperty({
    example: 'CANDIDATE',
    description: 'The role of the user',
  })
  role: UserRole;

  @Prop({ default: true })
  @ApiProperty({
    example: true,
    description: 'The active status of the user',
  })
  isActive: boolean;

  @Prop({ default: UserStatus.ACTIVE, enum: UserStatus })
  @ApiProperty({
    example: 'ACTIVE',
    description: 'The status of the user',
  })
  status: UserStatus;

  @ApiProperty({
    example: '123456789',
    description: 'The reset password token of the user',
  })
  @Prop()
  resetPasswordToken?: string;

  @ApiProperty({
    example: '2025-12-31T23:19:15.123Z',
    description: 'The reset password expires of the user',
  })
  @Prop()
  resetPasswordExpires?: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);
