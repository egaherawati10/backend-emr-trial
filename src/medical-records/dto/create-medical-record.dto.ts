import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsInt() @Min(1)
  patientId!: number;

  @IsInt() @Min(1)
  doctorId!: number;

  @IsInt() @Min(1)
  clerkId!: number;

  @IsDateString()
  visitDate!: string; // ISO string

  @IsString() @IsNotEmpty()
  diagnosis!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}