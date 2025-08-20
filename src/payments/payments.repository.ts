import { Injectable } from '@nestjs/common';
import { Payment, PaymentItem, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IPaymentsRepository, PaymentCreate, PaymentInclude, PaymentOrder, PaymentUpdate, PaymentWhere } from './payments.repository.interface';

@Injectable()
export class PaymentsRepository implements IPaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: { skip?: number; take?: number; where?: PaymentWhere; orderBy?: PaymentOrder; include?: PaymentInclude }): Promise<Payment[]> {
    return this.prisma.payment.findMany(params);
  }

  count(where?: PaymentWhere): Promise<number> {
    return this.prisma.payment.count({ where });
  }

  findById(id: number, include?: PaymentInclude): Promise<Payment | null> {
    return this.prisma.payment.findUnique({ where: { id }, include });
  }

  create(data: PaymentCreate, include?: PaymentInclude): Promise<Payment> {
    return this.prisma.payment.create({ data, include });
  }

  update(id: number, data: PaymentUpdate, include?: PaymentInclude): Promise<Payment> {
    return this.prisma.payment.update({ where: { id }, data, include });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.payment.delete({ where: { id } });
  }

  // Items
  findItemById(id: number): Promise<PaymentItem | null> {
    return this.prisma.paymentItem.findUnique({ where: { id } });
  }

  createItem(data: Prisma.PaymentItemUncheckedCreateInput): Promise<PaymentItem> {
    return this.prisma.paymentItem.create({ data });
  }

  updateItem(id: number, data: Prisma.PaymentItemUncheckedUpdateInput): Promise<PaymentItem> {
    return this.prisma.paymentItem.update({ where: { id }, data });
  }

  async deleteItem(id: number): Promise<void> {
    await this.prisma.paymentItem.delete({ where: { id } });
  }
}

/** Build Prisma include from high-level include param. */
export function buildPaymentInclude(input?: string | string[] | boolean): Prisma.PaymentInclude | undefined {
  if (!input) return undefined;

  let keys: string[];
  if (input === true || input === 'true') {
    keys = ['medicalRecord', 'patient', 'items.deep'];
  } else if (Array.isArray(input)) {
    keys = input;
  } else {
    keys = input.split(',').map(s => s.trim()).filter(Boolean);
  }

  const include: Prisma.PaymentInclude = {};
  for (const k of keys) {
    switch (k) {
      case 'medicalRecord': include.medicalRecord = true; break;
      case 'patient': include.patient = true; break;
      case 'items':
        include.items = true; break;
      case 'items.prescriptionItem':
        include.items = { include: { prescriptionItem: true } }; break;
      case 'items.serviceItem':
        include.items = { include: { serviceOnServiceItem: { include: { serviceItem: true, service: true } } } }; break;
      case 'items.deep':
        include.items = {
          include: {
            prescriptionItem: true,
            serviceOnServiceItem: { include: { serviceItem: true, service: true } },
          },
        };
        break;
      default: break;
    }
  }
  return Object.keys(include).length ? include : undefined;
}