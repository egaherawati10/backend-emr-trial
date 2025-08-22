import { IsInt, Min, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class RxItemInput {
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(1)
  medicineId!: number;

  @IsString() dosage!: string;

  @Transform(({ value }) => Number(value))
  @IsInt() @Min(1)
  quantity!: number;

  /** optional override; otherwise price is taken from Medicine.price */
  @IsOptional() @IsString()
  price?: string;

  @IsOptional() @IsString()
  instructions?: string;
}

export class CreatePrescriptionDto {
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(1)
  medicalRecordId!: number;

  @IsOptional() @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RxItemInput)
  items!: RxItemInput[];
}