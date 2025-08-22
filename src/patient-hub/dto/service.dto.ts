import { IsInt, Min, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ServiceLineInput {
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(1)
  serviceItemId!: number;

  @Transform(({ value }) => Number(value ?? 1))
  @IsInt() @Min(1)
  quantity = 1;
}

export class CreateServiceDto {
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(1)
  medicalRecordId!: number;

  @IsArray()
  @Type(() => ServiceLineInput)
  items!: ServiceLineInput[];
}