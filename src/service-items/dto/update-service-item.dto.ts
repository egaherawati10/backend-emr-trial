import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateServiceItemDto {
  @IsOptional() @IsString() @IsNotEmpty()
  name?: string;

  @IsOptional() @IsNumber()
  price?: number;
}