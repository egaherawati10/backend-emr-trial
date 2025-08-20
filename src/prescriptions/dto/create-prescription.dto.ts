import { IsDateString, IsInt, Min, IsOptional, IsString } from 'class-validator';

export class CreatePrescriptionDto {
  @IsInt() @Min(1)
  medicalRecordId!: number;

  @IsInt() @Min(1)
  doctorId!: number;

  @IsInt() @Min(1)
  pharmacistId?: number;

  @IsInt() @Min(1)
  patientId!: number;

  @IsDateString()
  dateIssued!: string;

  @IsOptional() @IsString()
  notes?: string;
}