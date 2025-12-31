import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from '../schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  password: string;

  @IsEnum(UserRole, { message: 'Role must be CANDIDATE or RECRUITER' })
  @ApiProperty({
    example: 'CANDIDATE',
    description: 'The role of the user',
  })
  role: UserRole;
}
