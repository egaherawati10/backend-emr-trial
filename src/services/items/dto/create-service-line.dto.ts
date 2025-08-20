import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateServiceLineDto {
  @IsInt() @Min(1)
  serviceItemId!: number;

  @IsInt() @Min(1)
  quantity!: number;

  // If omitted, price will be copied from ServiceItem.price
  @IsOptional() @IsNumber()
  price?: number;
}