import { PrismaClient } from '@prisma/client';

export async function seedPrescriptions(prisma: PrismaClient) {
  const medrecs = await prisma.medicalRecord.findMany({ orderBy: { id: 'asc' } });
  const pharmacists = await prisma.user.findMany({ where: { role: 'pharmacist' }, orderBy: { id: 'asc' } });

  for (let i = 0; i < 10; i++) {
    const mr = medrecs[i % medrecs.length];
    const pharmacistId = i % 2 === 0 ? pharmacists[i % pharmacists.length]?.id ?? null : null;
    const code = `RX-${String(i + 1).padStart(4, '0')}`;

    await prisma.prescription.upsert({
      where: { code },
      update: {
        pharmacistId,
        status: i < 6 ? 'issued' : 'dispensed',
        dateIssued: new Date(Date.now() - i * 3600_000),
        dateDispensed: i >= 6 ? new Date(Date.now() - (i - 5) * 3600_000) : null,
        updatedById: mr.doctorId,
      },
      create: {
        code,
        medicalRecordId: mr.id,
        doctorId: mr.doctorId,
        pharmacistId,
        patientId: mr.patientId,
        status: i < 6 ? 'issued' : 'dispensed',
        dateIssued: new Date(Date.now() - i * 3600_000),
        dateDispensed: i >= 6 ? new Date(Date.now() - (i - 5) * 3600_000) : null,
        notes: `Prescription #${i + 1}`,
        createdById: mr.doctorId,
        updatedById: mr.doctorId,
      },
    });
  }

  console.log('Prescription: 10 (upsert by code)');
}