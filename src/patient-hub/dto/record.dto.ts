import { IsInt, Min, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRecordDto {
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(1)
  medicalRecordId!: number;

  @IsOptional() @IsString() subjective?: string;
  @IsOptional() @IsString() objective?: string;
  @IsOptional() @IsString() assessment?: string;
  @IsOptional() @IsString() planning?: string;
}