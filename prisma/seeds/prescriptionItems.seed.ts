import { Prisma, PrismaClient } from '@prisma/client';

export async function seedPrescriptionItems(prisma: PrismaClient) {
  const rxes = await prisma.prescription.findMany({ orderBy: { id: 'asc' } });
  const meds = await prisma.medicine.findMany({ orderBy: { id: 'asc' } });

  for (let i = 0; i < 10; i++) {
    const rx = rxes[i % rxes.length];
    const med = meds[i % meds.length];

    // unique per (prescriptionId, medicineId)
    const exists = await prisma.prescriptionItem.findUnique({
      where: { prescriptionId_medicineId: { prescriptionId: rx.id, medicineId: med.id } },
    });
    if (exists) continue;

    await prisma.prescriptionItem.create({
      data: {
        prescriptionId: rx.id,
        medicineId: med.id,
        dosage: `1 tab ${((i % 3) + 1)}x daily`,
        quantity: 10 + i,
        price: new Prisma.Decimal(med.price.toString()),
        instructions: 'After meals',
      },
    });
  }

  console.log('PrescriptionItem: ~10');
}