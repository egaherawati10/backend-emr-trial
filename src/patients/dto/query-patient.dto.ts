import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min, IsIn, IsPositive } from 'class-validator';

export class QueryPatientDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  search?: string; // name/email/username/phone

  @ApiPropertyOptional({ enum: Gender }) @IsOptional() @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional() @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt() @Min(1)
  clerkId?: number;

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value))
  @IsOptional() @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => Number(value))
  @IsOptional() @IsInt() @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['createdAt', 'updatedAt', 'dob', 'name'], default: 'createdAt' })
  @IsOptional() @IsIn(['createdAt', 'updatedAt', 'dob', 'name'])
  sortBy?: 'createdAt' | 'updatedAt' | 'dob' | 'name' = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional() @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}