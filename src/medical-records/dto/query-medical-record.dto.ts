import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, IsPositive, IsString } from 'class-validator';

export class QueryMedicalRecordDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  search?: string; // diagnosis/notes

  @ApiPropertyOptional() @IsOptional() @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value))
  @IsOptional() @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => Number(value))
  @IsOptional() @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['visitDate','createdAt','updatedAt'], default: 'visitDate' })
  @IsOptional() @IsIn(['visitDate','createdAt','updatedAt'])
  sortBy?: 'visitDate' | 'createdAt' | 'updatedAt' = 'visitDate';

  @ApiPropertyOptional({ enum: ['asc','desc'], default: 'desc' })
  @IsOptional() @IsIn(['asc','desc'])
  order?: 'asc' | 'desc' = 'desc';
}