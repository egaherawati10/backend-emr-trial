import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryMedicineDto {
  @IsOptional() @Transform(({value}) => Number(value)) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Transform(({value}) => Number(value)) @IsInt() @Min(1)
  pageSize?: number = 20;

  @IsOptional() @IsString()
  search?: string; // matches name/manufacturer/type (contains)
}