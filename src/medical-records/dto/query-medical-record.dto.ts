import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryMedicalRecordDto {
  @IsOptional() @Transform(({value}) => Number(value)) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Transform(({value}) => Number(value)) @IsInt() @Min(1)
  pageSize?: number = 20;

  @IsOptional() @IsIn(['id','visitDate','createdAt','updatedAt'])
  sortBy?: 'id' | 'visitDate' | 'createdAt' | 'updatedAt' = 'visitDate';

  @IsOptional() @IsIn(['asc','desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional() @Transform(({value}) => Number(value))
  patientId?: number;

  @IsOptional() @Transform(({value}) => Number(value))
  doctorId?: number;

  @IsOptional() @Transform(({value}) => Number(value))
  clerkId?: number;

  @IsOptional() @IsDateString()
  visitFrom?: string;

  @IsOptional() @IsDateString()
  visitTo?: string;

  /**
   * Comma-separated includes: patient,doctor,clerk,records,prescriptions,services,payments
   * Nested are auto-included: prescriptions.items, services.serviceItems.serviceItem, payments.items
   */
  @IsOptional() @IsString()
  include?: string;

  /** Shortcut to include all relations */
  @IsOptional() @Transform(({value}) => value === 'true' || value === true) @IsBoolean()
  includeAll?: boolean;
}