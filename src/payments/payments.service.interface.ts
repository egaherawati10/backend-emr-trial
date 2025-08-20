import { Payment, PaymentItem, UserRole } from '@prisma/client';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreatePaymentItemDto } from './items/dto/create-payment-item.dto';
import { UpdatePaymentItemDto } from './items/dto/update-payment-item.dto';

export type IncludeParam = string | string[] | boolean;
export interface Actor { userId: number; role: UserRole; }

export interface IPaymentsService {
  list(query: QueryPaymentDto, actor: Actor): Promise<{ data: Payment[]; total: number; page: number; pageSize: number }>;
  getById(id: number, include?: IncludeParam, actor?: Actor): Promise<Payment>;
  create(dto: CreatePaymentDto, include?: IncludeParam): Promise<Payment>;
  update(id: number, dto: UpdatePaymentDto, include?: IncludeParam): Promise<Payment>;
  remove(id: number): Promise<void>;

  addItem(paymentId: number, dto: CreatePaymentItemDto): Promise<PaymentItem>;
  updateItem(paymentId: number, itemId: number, dto: UpdatePaymentItemDto): Promise<PaymentItem>;
  removeItem(paymentId: number, itemId: number): Promise<void>;
}