import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicineDto } from './create-medicine.dto';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateMedicineDto extends PartialType(CreateMedicineDto) {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  dosage?: string;

  @IsOptional() @IsString()
  type?: string;

  @IsOptional() @IsString()
  manufacturer?: string;

  @IsOptional() @IsInt() @Min(0)
  stock?: number;

  @IsOptional() @IsNumber()
  price?: number;
}