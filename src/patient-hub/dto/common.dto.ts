import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min, IsDateString } from 'class-validator';

export class PatientParamDto {
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(1)
  patientId!: number;
}

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value ?? 1))
  @IsInt() @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => Number(value ?? 20))
  @IsInt() @Min(1)
  limit = 20;
}

export class DateRangeDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}