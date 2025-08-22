import { IsInt, Min, IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaymentMethod, PaymentItemKind } from '@prisma/client';

export class PaymentItemInput {
  @IsEnum(PaymentItemKind) kind!: PaymentItemKind;

  // one-of
  @Transform(({ value }) => (value == null ? value : Number(value)))
  @IsOptional() @IsInt() @Min(1)
  prescriptionItemId?: number;

  @Transform(({ value }) => (value == null ? value : Number(value)))
  @IsOptional() @IsInt() @Min(1)
  serviceOnServiceItemId?: number;

  /** optional override; otherwise computed from source line */
  @IsOptional() @IsString()
  amount?: string;

  @IsOptional() @IsString()
  description?: string;
}

export class CreatePaymentDto {
  @Transform(({ value }) => Number(value))
  @IsInt() @Min(1)
  medicalRecordId!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemInput)
  items!: PaymentItemInput[];
}