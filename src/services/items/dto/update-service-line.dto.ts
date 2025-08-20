import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateServiceLineDto {
  @IsOptional() @IsInt() @Min(1)
  serviceItemId?: number;

  @IsOptional() @IsInt() @Min(1)
  quantity?: number;

  @IsOptional() @IsNumber()
  price?: number;
}