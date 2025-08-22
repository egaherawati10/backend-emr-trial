import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/users.seed';
import { seedPatientProfiles } from './seeds/patientProfiles.seed';
import { seedMedicines } from './seeds/medicines.seed';
import { seedServiceItems } from './seeds/serviceItems.seed';
import { seedMedicalRecords } from './seeds/medicalRecords.seed';
import { seedRecords } from './seeds/records.seed';
import { seedServices } from './seeds/services.seed';
import { seedPrescriptions } from './seeds/prescriptions.seed';
import { seedPrescriptionItems } from './seeds/prescriptionItems.seed';
import { seedPayments } from './seeds/payments.seed';
import { seedPaymentItems } from './seeds/paymentItems.seed';
import { seedServiceOnServiceItems } from './seeds/serviceOnServiceItems.seed';

const prisma = new PrismaClient();

async function main() {
  console.time('seed');
  await seedUsers(prisma);
  await seedPatientProfiles(prisma);
  await seedMedicines(prisma);
  await seedServiceItems(prisma);
  await seedMedicalRecords(prisma);
  await seedRecords(prisma);
  await seedServices(prisma);
  await seedServiceOnServiceItems(prisma);
  await seedPrescriptions(prisma);
  await seedPrescriptionItems(prisma);
  await seedPayments(prisma);
  await seedPaymentItems(prisma);
  console.timeEnd('seed');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });