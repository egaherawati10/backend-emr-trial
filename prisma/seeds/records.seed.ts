import { PrismaClient } from '@prisma/client';

export async function seedRecords(prisma: PrismaClient) {
  const medrecs = await prisma.medicalRecord.findMany({ orderBy: { id: 'asc' } });
  for (let i = 0; i < 10; i++) {
    const mr = medrecs[i % medrecs.length];
    const subjective = `S: patient reports symptom ${i + 1}`;

    const exists = await prisma.record.findFirst({
      where: { medicalRecordId: mr.id, subjective },
    });
    if (exists) continue;

    await prisma.record.create({
      data: {
        medicalRecordId: mr.id,
        patientId: mr.patientId,
        doctorId: mr.doctorId,
        subjective,
        objective: `O: vitals WNL; obs ${i + 1}`,
        assessment: `A: probable ${['viral infection', 'allergic rhinitis'][i % 2]}`,
        planning: `P: rest + hydration + followup ${i + 1}`,
        createdById: mr.doctorId,
        updatedById: mr.doctorId,
      },
    });
  }
  console.log('Record: ~10');
}