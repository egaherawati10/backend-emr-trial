import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePrescriptionItemDto {
  @IsInt() @Min(1)
  medicineId!: number;

  @IsString() @IsNotEmpty()
  dosage!: string;

  @IsInt() @Min(1)
  quantity!: number;

  // If omitted, service will copy Medicine.price
  @IsOptional() @IsNumber()
  price?: number;

  @IsOptional() @IsString()
  instructions?: string;
}