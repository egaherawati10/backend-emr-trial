import { Prisma, PrismaClient, PaymentMethod, PaymentStatus } from '@prisma/client';

export async function seedPayments(prisma: PrismaClient) {
  const medrecs = await prisma.medicalRecord.findMany({ orderBy: { id: 'asc' } });
  const cashiers = await prisma.user.findMany({ where: { role: 'cashier' }, orderBy: { id: 'asc' } });

  const STATUS: PaymentStatus[] = ['paid', 'pending', 'cancelled'];
  const METHOD: PaymentMethod[] = ['cash', 'card', 'transfer', 'insurance'];

  for (let i = 0; i < 10; i++) {
    const mr = medrecs[i % medrecs.length];
    const cashier = cashiers[i % Math.max(1, cashiers.length)];
    const code = `PMT-${String(i + 1).padStart(4, '0')}`;
    const status = STATUS[i % STATUS.length];
    const method = METHOD[i % METHOD.length];

    await prisma.payment.upsert({
      where: { code },
      update: {
        status,
        method,
        issuedAt: new Date(Date.now() - i * 1_800_000),
        paidAt: status === 'paid' ? new Date(Date.now() - i * 1_800_000 + 120_000) : null,
        updatedById: cashier?.id ?? null,
      },
      create: {
        code,
        medicalRecordId: mr.id,
        patientId: mr.patientId,
        status,
        method,
        issuedAt: new Date(Date.now() - i * 1_800_000),
        paidAt: status === 'paid' ? new Date(Date.now() - i * 1_800_000 + 120_000) : null,
        totalAmount: new Prisma.Decimal(0),
        createdById: cashier?.id ?? null,
        updatedById: cashier?.id ?? null,
      },
    });
  }
  console.log('Payment: 10 (upsert by code)');
}