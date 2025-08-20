import { IsDateString, IsEnum, IsInt, Min } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @IsInt() @Min(1) medicalRecordId!: number;
  @IsInt() @Min(1) patientId!: number;

  @IsEnum(PaymentStatus) status!: PaymentStatus; // e.g., pending
  @IsEnum(PaymentMethod) method!: PaymentMethod; // cash/card/...

  @IsDateString() date!: string; // ISO string

  // totalAmount is computed from items; start at 0 on create
}