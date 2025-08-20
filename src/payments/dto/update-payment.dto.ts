import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class UpdatePaymentDto {
  @IsOptional() @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional() @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional() @IsDateString()
  date?: string;
}