import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalRecordDto } from './create-medical-record.dto';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {
  @IsOptional() @IsInt() @Min(1)
  patientId?: number;

  @IsOptional() @IsInt() @Min(1)
  doctorId?: number;

  @IsOptional() @IsInt() @Min(1)
  clerkId?: number;

  @IsOptional() @IsDateString()
  visitDate?: string;

  @IsOptional() @IsString()
  diagnosis?: string;

  @IsOptional() @IsString()
  notes?: string;
}