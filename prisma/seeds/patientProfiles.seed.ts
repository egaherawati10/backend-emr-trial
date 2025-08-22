import { PrismaClient, Gender } from '@prisma/client';

export async function seedPatientProfiles(prisma: PrismaClient) {
  const patients = await prisma.user.findMany({
    where: { role: 'patient' },
    orderBy: { id: 'asc' },
    take: 10,
  });

  const clerks = await prisma.user.findMany({
    where: { role: 'registration_clerk' },
    orderBy: { id: 'asc' },
  });

  const genders: Gender[] = ['male', 'female', 'other'];

  for (let i = 0; i < 10; i++) {
    const u = patients[i % patients.length];
    const clerk = clerks[i % Math.max(1, clerks.length)] ?? null;

    await prisma.patientProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        dob: new Date(1990, i % 12, (i % 28) + 1),
        gender: genders[i % genders.length],
        address: `Jl. Contoh No.${i + 1}, Jakarta`,
        phone: `08123${String(100000 + i)}`,
        clerkId: clerk?.id ?? null,
      },
    });
  }

  console.log('✅ PatientProfile seeded: 10');
}