import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional() @IsInt() @Min(1) patientId?: number;
  @IsOptional() @IsInt() @Min(1) doctorId?: number;
  @IsOptional() @IsInt() @Min(1) medicalRecordId?: number;
}