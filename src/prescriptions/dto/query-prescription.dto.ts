import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class QueryPrescriptionDto {
  @IsOptional() @Transform(({value}) => Number(value)) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Transform(({value}) => Number(value)) @IsInt() @Min(1)
  pageSize?: number = 20;

  @IsOptional() @IsIn(['id','dateIssued','createdAt','updatedAt'])
  sortBy?: 'id'|'dateIssued'|'createdAt'|'updatedAt' = 'dateIssued';

  @IsOptional() @IsIn(['asc','desc'])
  sortOrder?: 'asc'|'desc' = 'desc';

  @IsOptional() @Transform(({value}) => Number(value))
  medicalRecordId?: number;

  @IsOptional() @Transform(({value}) => Number(value))
  doctorId?: number;

  @IsOptional() @Transform(({value}) => Number(value))
  pharmacistId?: number;

  @IsOptional() @Transform(({value}) => Number(value))
  patientId?: number;

  @IsOptional() @IsDateString()
  issuedFrom?: string;

  @IsOptional() @IsDateString()
  issuedTo?: string;

  /** "patient,doctor,pharmacist,medicalRecord,items" */
  @IsOptional()
  include?: string;

  @IsOptional() @Transform(({value}) => value === 'true' || value === true)
  includeAll?: boolean;
}