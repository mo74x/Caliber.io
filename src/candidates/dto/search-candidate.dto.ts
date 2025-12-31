import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchCandidateDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Node.js', description: 'Filter by skill' })
  skill?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Backend Developer',
    description: 'Filter by job title',
  })
  jobTitle?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 50000, description: 'Maximum salary filter' })
  maxSalary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({ example: 1, description: 'Page number', default: 1 })
  page?: number = 1; // Default to Page 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
    default: 10,
  })
  limit?: number = 10; // Default to 10 items per page
}
