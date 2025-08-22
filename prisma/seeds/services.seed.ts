import { PrismaClient } from '@prisma/client';

export async function seedServices(prisma: PrismaClient) {
  const medrecs = await prisma.medicalRecord.findMany({ orderBy: { id: 'asc' } });

  for (let i = 0; i < 10; i++) {
    const mr = medrecs[i % medrecs.length];
    const code = `SVC-${String(i + 1).padStart(4, '0')}`;

    await prisma.service.upsert({
      where: { code },
      update: {
        status: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'in_progress' : 'planned',
        serviceDate: new Date(Date.now() - (i % 5) * 3600_000),
        updatedById: mr.doctorId,
      },
      create: {
        code,
        patientId: mr.patientId,
        doctorId: mr.doctorId,
        medicalRecordId: mr.id,
        status: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'in_progress' : 'planned',
        serviceDate: new Date(Date.now() - (i % 5) * 3600_000),
        createdById: mr.doctorId,
        updatedById: mr.doctorId,
      },
    });
  }
  console.log('Service: 10 (upsert by code)');
}