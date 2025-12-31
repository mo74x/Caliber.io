import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsString,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Senior Backend Developer',
    description: 'The role the candidate wants',
  })
  jobTitle: string;

  @IsArray()
  @IsString({ each: true }) // Checks that every item in array is a string
  @ApiProperty({
    example: ['Node.js', 'TypeScript', 'Express'],
    description: 'The skills the candidate has',
  })
  skills: string[];

  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 5,
    description: 'The years of experience the candidate has',
  })
  experienceYears: number;

  @IsNumber()
  @ApiProperty({
    example: 5000,
    description: 'The minimum salary the candidate is looking for',
  })
  minSalary: number;

  @IsString()
  @ApiProperty({
    example: '6 months',
    description: 'The notice period the candidate is looking for',
  })
  noticePeriod: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the candidate',
  })
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '123456789',
    description: 'The phone number of the candidate',
  })
  phone: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'https://linkedin.com/in/johndoe',
    description: 'The LinkedIn profile of the candidate',
  })
  linkedinUrl: string;
}
