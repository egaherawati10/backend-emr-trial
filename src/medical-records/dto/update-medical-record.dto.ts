import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateMedicalRecordDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  doctorId?: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  clerkId?: number;

  @ApiPropertyOptional() @IsOptional() @IsDateString()
  visitDate?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  diagnosis?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string | null;
}