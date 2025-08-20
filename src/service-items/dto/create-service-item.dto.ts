import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateServiceItemDto {
  @IsString() @IsNotEmpty()
  name!: string;

  @IsNumber()
  price!: number;
}