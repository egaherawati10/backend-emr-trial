import { Prisma, PrismaClient } from '@prisma/client';

export async function seedPaymentItems(prisma: PrismaClient) {
  const payments = await prisma.payment.findMany({ orderBy: { id: 'asc' } });
  const rxItems  = await prisma.prescriptionItem.findMany({ orderBy: { id: 'asc' } });
  const svcLines = await prisma.serviceOnServiceItem.findMany({
    orderBy: { id: 'asc' },
    include: { serviceItem: true },
  });

  // Create/ensure 10 items, alternating kinds
  for (let i = 0; i < 10; i++) {
    const pay = payments[i % payments.length];

    if (i % 2 === 0) {
      const pi = rxItems[i % rxItems.length];
      const amount = new Prisma.Decimal(pi.price.toString()).mul(pi.quantity);

      const exists = await prisma.paymentItem.findFirst({
        where: { paymentId: pay.id, kind: 'prescription_item', prescriptionItemId: pi.id },
      });
      if (!exists) {
        await prisma.paymentItem.create({
          data: {
            paymentId: pay.id,
            kind: 'prescription_item',
            description: `RX item ${pi.id}`,
            amount,
            prescriptionItemId: pi.id,
          },
        });
      }
    } else {
      const sl = svcLines[i % svcLines.length];
      const amount = new Prisma.Decimal(sl.unitPrice.toString()).mul(sl.quantity);

      const exists = await prisma.paymentItem.findFirst({
        where: { paymentId: pay.id, kind: 'service_item', serviceOnServiceItemId: sl.id },
      });
      if (!exists) {
        await prisma.paymentItem.create({
          data: {
            paymentId: pay.id,
            kind: 'service_item',
            description: `Service line ${sl.id}`,
            amount,
            serviceOnServiceItemId: sl.id,
          },
        });
      }
    }
  }

  // Recompute totals per payment
  for (const p of payments) {
    const items = await prisma.paymentItem.findMany({ where: { paymentId: p.id } });
    const subtotal = items.reduce(
      (acc, it) => acc.add(new Prisma.Decimal(it.amount.toString())),
      new Prisma.Decimal(0),
    );
    const discount = new Prisma.Decimal(0);
    const tax = new Prisma.Decimal(0);
    const total = subtotal.minus(discount).plus(tax);

    await prisma.payment.update({
      where: { id: p.id },
      data: { totalAmount: total },
    });
  }

  console.log('PaymentItem seeded: up to 10 new + totals updated');
}