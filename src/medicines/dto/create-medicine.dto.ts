import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateMedicineDto {
  @IsString() @IsNotEmpty()
  name!: string;

  @IsString() @IsNotEmpty()
  dosage!: string;

  @IsString() @IsNotEmpty()
  type!: string;

  @IsString() @IsNotEmpty()
  manufacturer!: string;

  @IsInt() @Min(0)
  stock!: number;

  @IsNumber()
  price!: number;
}