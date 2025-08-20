import { IsDateString, IsInt, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class UpdatePrescriptionDto {
  @IsOptional() @IsInt() @Min(1)
  medicalRecordId?: number;

  @IsOptional() @IsInt() @Min(1)
  doctorId?: number;

  @IsOptional()
  @ValidateIf((_, v) => v !== null) @IsInt() @Min(1)
  pharmacistId?: number | null;

  @IsOptional() @IsInt() @Min(1)
  patientId?: number;

  @IsOptional() @IsDateString()
  dateIssued?: string;

  @IsOptional() @IsString()
  notes?: string;
}