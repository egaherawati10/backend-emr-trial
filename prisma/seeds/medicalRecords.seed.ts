import { PrismaClient } from '@prisma/client';

export async function seedMedicalRecords(prisma: PrismaClient) {
  const patients = await prisma.patientProfile.findMany({ orderBy: { id: 'asc' } });
  const doctors  = await prisma.user.findMany({ where: { role: 'doctor' }, orderBy: { id: 'asc' } });
  const clerks   = await prisma.user.findMany({ where: { role: 'registration_clerk' }, orderBy: { id: 'asc' } });

  for (let i = 0; i < 10; i++) {
    const p = patients[i % patients.length];
    const d = doctors[i % doctors.length];
    const c = clerks[i % clerks.length];

    const visitDate = new Date(Date.now() - i * 86400000);
    const sameDay = await prisma.medicalRecord.findFirst({
      where: {
        patientId: p.id,
        visitDate: {
          gte: new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate()),
          lt:  new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate() + 1),
        },
      },
    });
    if (sameDay) continue;

    await prisma.medicalRecord.create({
      data: {
        patientId: p.id,
        doctorId: d.id,
        clerkId: c.id,
        visitDate,
        diagnosis: ['Flu', 'Cough', 'Headache', 'Allergy'][i % 4],
        notes: `Visit notes #${i + 1}`,
        createdById: d.id,
        updatedById: d.id,
      },
    });
  }
  console.log('MedicalRecord: ~10 (skips dup days)');
}