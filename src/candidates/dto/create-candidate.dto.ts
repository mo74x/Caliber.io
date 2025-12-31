import { IsNotEmpty, IsNumber, IsArray, IsString, Min } from 'class-validator';

export class CreateCandidateDto {
  @IsNotEmpty()
  @IsString()
  jobTitle: string;

  @IsArray()
  @IsString({ each: true }) // Checks that every item in array is a string
  skills: string[];

  @IsNumber()
  @Min(0)
  experienceYears: number;

  @IsNumber()
  minSalary: number;

  @IsString()
  noticePeriod: string;
}
