import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { hashSync } from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  const password = hashSync('password123', 10);

  const counts: Record<UserRole, number> = {
    admin: 1,
    doctor: 3,
    pharmacist: 2,
    cashier: 2,
    registration_clerk: 2,
    patient: 12,
  };

  const toCreate = (Object.keys(counts) as UserRole[]).flatMap((role) =>
    Array.from({ length: counts[role] }).map((_, i) => ({
      name: `${role.replace('_', ' ')} ${i + 1}`,
      username: `${role}${i + 1}`,
      email: `${role}${i + 1}@example.com`,
      password,
      role,
      status: UserStatus.active,
    }))
  );

  for (const u of toCreate) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }
  console.log(`Users: ${toCreate.length}`);
}