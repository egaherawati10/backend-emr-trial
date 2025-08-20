import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class QueryServiceDto {
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1)
  pageSize?: number = 20;

  @IsOptional() @Transform(({ value }) => Number(value))
  patientId?: number;

  @IsOptional() @Transform(({ value }) => Number(value))
  doctorId?: number;

  @IsOptional() @Transform(({ value }) => Number(value))
  medicalRecordId?: number;

  @IsOptional() @IsIn(['id', 'createdAt', 'updatedAt'])
  sortBy?: 'id' | 'createdAt' | 'updatedAt' = 'createdAt';

  @IsOptional() @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  /** "patient,doctor,medicalRecord,items" */
  @IsOptional() include?: string;

  @IsOptional() @Transform(({ value }) => value === 'true' || value === true)
  includeAll?: boolean;
}