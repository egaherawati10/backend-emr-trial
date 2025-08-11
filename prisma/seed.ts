import { PrismaClient, UserRole, UserStatus, PaymentStatus } from '@prisma/client';
import { hash } from 'bcrypt';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {

  const adminPassword = await hash('admin123', 10);
  const doctorPassword = await hash('doctor123', 10);
  const pharmacistPassword = await hash('pharma123', 10);
  const cashierPassword = await hash('cashier123', 10);
  const patientPassword = await hash('patient123', 10);

  // Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin One',
      username: 'admin1',
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.admin,
      status: UserStatus.active,
    },
  });

  const doctor = await prisma.user.create({
    data: {
      name: 'Dr. John Doe',
      username: 'drjohn',
      email: 'doctor@example.com',
      password: doctorPassword,
      role: UserRole.doctor,
      status: UserStatus.active,
    },
  });

  const pharmacist = await prisma.user.create({
    data: {
      name: 'Pharmacist Jane',
      username: 'jane',
      email: 'pharmacist@example.com',
      password: pharmacistPassword,
      role: UserRole.pharmacist,
      status: UserStatus.active,
    },
  });

  const cashier = await prisma.user.create({
    data: {
      name: 'Cashier Mike',
      username: 'mike',
      email: 'cashier@example.com',
      password: cashierPassword,
      role: UserRole.cashier,
      status: UserStatus.active,
    },
  });

  const patientUser = await prisma.user.create({
    data: {
      name: 'Patient Sam',
      username: 'sam',
      email: 'patient@example.com',
      password: patientPassword,
      role: UserRole.patient,
      status: UserStatus.active,
    },
  });

  // Patient Profile
  const patientProfile = await prisma.patientProfile.create({
    data: {
      userId: patientUser.id,
      dob: new Date('1990-05-15'),
      gender: 'Male',
      address: '123 Main St',
      phone: '08123456789',
    },
  });

  // Medicines
  const medicine1 = await prisma.medicine.create({
    data: {
      name: 'Paracetamol',
      type: 'Tablet',
      stock: 200,
      price: 5000,
    },
  });

  const medicine2 = await prisma.medicine.create({
    data: {
      name: 'Amoxicillin',
      type: 'Capsule',
      stock: 150,
      price: 10000,
    },
  });

  // Medical Record
  const medicalRecord = await prisma.medicalRecord.create({
    data: {
      patientId: patientProfile.id,
      doctorId: doctor.id,
      visitDate: new Date(),
      diagnosis: 'Common Cold',
      notes: 'Rest and drink fluids',
    },
  });

  // Prescription
  const prescription = await prisma.prescription.create({
    data: {
      medicalRecordId: medicalRecord.id,
      pharmacistId: pharmacist.id,
      dateIssued: new Date(),
      notes: 'Take after meals',
    },
  });

  // Prescription Items
  await prisma.prescriptionItem.createMany({
    data: [
      {
        prescriptionId: prescription.id,
        medicineId: medicine1.id,
        dosage: '500mg',
        quantity: 10,
        instructions: 'Take one tablet twice daily',
      },
      {
        prescriptionId: prescription.id,
        medicineId: medicine2.id,
        dosage: '250mg',
        quantity: 14,
        instructions: 'Take one capsule every 8 hours',
      },
    ],
  });

  // Payment
  const payment = await prisma.payment.create({
    data: {
      patientId: patientProfile.id,
      cashierId: cashier.id,
      totalAmount: 80000,
      paymentDate: new Date(),
      method: 'Cash',
      status: PaymentStatus.paid,
    },
  });

  // Payment Items
  await prisma.paymentItem.createMany({
    data: [
      {
        paymentId: payment.id,
        description: 'Consultation Fee',
        amount: 50000,
      },
      {
        paymentId: payment.id,
        description: 'Medicines',
        amount: 30000,
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
