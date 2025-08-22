import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();

    this.$use(async (params, next) => {
      // --- Guard: Payment.status = 'paid' requires paidAt (app-layer mirror of DB check)
      if (params.model === 'Payment' && ['create', 'update', 'upsert'].includes(params.action)) {
        const data: any = params.args?.data ?? {};
        const read = (o: any, k: string) => o?.[k] ?? o?.update?.[k] ?? o?.create?.[k];
        const status = read(data, 'status');
        const paidAt = read(data, 'paidAt');
        if (status === 'paid' && !paidAt) {
          throw new Error('paidAt must be set when status = "paid"');
        }
      }

      // --- Guard: PaymentItem.kind must match which FK is set (mirror of DB check)
      if (params.model === 'PaymentItem' && ['create', 'update', 'upsert'].includes(params.action)) {
        const data: any = params.args?.data ?? {};
        const read = (o: any, k: string) => o?.[k] ?? o?.update?.[k] ?? o?.create?.[k];

        const kind = read(data, 'kind');
        const rxId = read(data, 'prescriptionItemId') ?? null;
        const sosiId = read(data, 'serviceOnServiceItemId') ?? null;

        if (kind === 'prescription_item') {
          if (!rxId || sosiId) {
            throw new Error('PaymentItem.kind=prescription_item requires prescriptionItemId and forbids serviceOnServiceItemId');
          }
        } else if (kind === 'service_item') {
          if (!sosiId || rxId) {
            throw new Error('PaymentItem.kind=service_item requires serviceOnServiceItemId and forbids prescriptionItemId');
          }
        } else {
          throw new Error('PaymentItem.kind must be either prescription_item or service_item');
        }
      }

      // Execute the operation
      const result = await next(params);

      // --- Keep Payment.totalAmount in sync whenever PaymentItem changes
      if (params.model === 'PaymentItem' && ['create', 'update', 'upsert', 'delete'].includes(params.action)) {
        let paymentId: number | null = null;

        // Try to read from args (create/update cases)
        const data: any = params.args?.data ?? {};
        paymentId = data?.paymentId ?? data?.update?.paymentId ?? data?.create?.paymentId ?? null;

        // If still unknown (update/delete by where), fetch it
        if (!paymentId) {
          const where: any = (params as any).args?.where;
          if (where) {
            const existing = await this.paymentItem.findUnique({ where, select: { paymentId: true } });
            paymentId = existing?.paymentId ?? null;
          }
        }

        if (paymentId) {
          // Recalc inside a short transaction to avoid races
          await this.$transaction(async (tx) => {
            const sum = await tx.paymentItem.aggregate({
              where: { paymentId },
              _sum: { amount: true },
            });
            const total = sum._sum.amount ?? new Prisma.Decimal(0);
            await tx.payment.update({
              where: { id: paymentId },
              data: { totalAmount: total },
            });
          });
        }
      }

      return result;
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}