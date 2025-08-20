import { IsInt, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class CreatePaymentItemDto {
  @IsString()
  description!: string;

  // Optional link to a prescription item or a service line (NOT both)
  @IsOptional() @IsInt() @Min(1)
  prescriptionItemId?: number;

  @IsOptional() @IsInt() @Min(1)
  serviceOnServiceItemId?: number;

  // If linked to an item and amount omitted, it will be derived (price * qty).
  @IsOptional() @IsNumber()
  @ValidateIf((_, v) => v !== null)
  amount?: number;
}