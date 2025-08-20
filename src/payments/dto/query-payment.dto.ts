import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class QueryPaymentDto {
  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1)
  pageSize?: number = 20;

  @IsOptional() @Transform(({ value }) => Number(value))
  medicalRecordId?: number;

  @IsOptional() @Transform(({ value }) => Number(value))
  patientId?: number;

  @IsOptional() @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional() @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional() @IsString()
  dateFrom?: string; // ISO

  @IsOptional() @IsString()
  dateTo?: string;   // ISO

  /** "medicalRecord,patient,items,items.prescriptionItem,items.serviceItem" */
  @IsOptional() @IsString()
  include?: string;

  @IsOptional() @Transform(({ value }) => value === 'true' || value === true)
  includeAll?: boolean;
}