import { Prisma, PrismaClient } from '@prisma/client';

export async function seedMedicines(prisma: PrismaClient) {
  const items = Array.from({ length: 10 }).map((_, i) => ({
    name: `Medicine-${i + 1}`,
    dosage: `${(i % 3) + 1}x${(i % 2) + 1}`,
    type: ['tablet', 'syrup', 'ointment'][i % 3],
    manufacturer: ['Acme Pharma', 'Her Health', 'Nusantara Med'][i % 3],
    stock: 100 + i * 5,
    reorderLevel: 20,
    unit: ['tablet', 'bottle', 'tube'][i % 3],
    batchNo: `BATCH-${1000 + i}`,
    expiryDate: new Date(2027, i % 12, (i % 28) + 1),
    price: new Prisma.Decimal((5000 + i * 750).toFixed(2)),
  }));

  for (const m of items) {
    await prisma.medicine.upsert({
      where: { name_dosage: { name: m.name, dosage: m.dosage } },
      update: {},
      create: m,
    });
  }
  console.log('Medicine: 10');
}