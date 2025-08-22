import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedicalRecordForPatientDto {
  @ApiProperty() @IsInt() @Min(1)
  doctorId!: number;

  @ApiProperty() @IsInt() @Min(1)
  clerkId!: number;

  @ApiProperty() @IsDateString()
  visitDate!: string;

  @ApiProperty() @IsString() @IsNotEmpty()
  diagnosis!: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string;
}