import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePrescriptionItemDto {
  @IsOptional() @IsInt() @Min(1)
  medicineId?: number;

  @IsOptional() @IsString()
  dosage?: string;

  @IsOptional() @IsInt() @Min(1)
  quantity?: number;

  @IsOptional() @IsNumber()
  price?: number;

  @IsOptional() @IsString()
  instructions?: string;
}