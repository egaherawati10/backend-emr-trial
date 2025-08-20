import { Payment, PaymentItem, Prisma } from '@prisma/client';

export type PaymentWhere = Prisma.PaymentWhereInput;
export type PaymentOrder = Prisma.PaymentOrderByWithRelationInput;
export type PaymentInclude = Prisma.PaymentInclude;
export type PaymentCreate = Prisma.PaymentUncheckedCreateInput;
export type PaymentUpdate = Prisma.PaymentUncheckedUpdateInput;

export interface IPaymentsRepository {
  findMany(params: { skip?: number; take?: number; where?: PaymentWhere; orderBy?: PaymentOrder; include?: PaymentInclude }): Promise<Payment[]>;
  count(where?: PaymentWhere): Promise<number>;
  findById(id: number, include?: PaymentInclude): Promise<Payment | null>;
  create(data: PaymentCreate, include?: PaymentInclude): Promise<Payment>;
  update(id: number, data: PaymentUpdate, include?: PaymentInclude): Promise<Payment>;
  delete(id: number): Promise<void>;

  // Items
  findItemById(id: number): Promise<PaymentItem | null>;
  createItem(data: Prisma.PaymentItemUncheckedCreateInput): Promise<PaymentItem>;
  updateItem(id: number, data: Prisma.PaymentItemUncheckedUpdateInput): Promise<PaymentItem>;
  deleteItem(id: number): Promise<void>;
}