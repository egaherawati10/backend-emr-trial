import { IsInt, Min } from 'class-validator';

export class CreateServiceDto {
  @IsInt() @Min(1) patientId!: number;
  @IsInt() @Min(1) doctorId!: number;
  @IsInt() @Min(1) medicalRecordId!: number;
}