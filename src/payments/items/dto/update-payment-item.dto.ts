import { IsInt, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class UpdatePaymentItemDto {
  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsInt() @Min(1)
  prescriptionItemId?: number | null;   // null to unlink

  @IsOptional() @IsInt() @Min(1)
  serviceOnServiceItemId?: number | null; // null to unlink

  @IsOptional() @IsNumber()
  @ValidateIf((_, v) => v !== null)
  amount?: number | null; // null -> recompute if link exists, else 400
}