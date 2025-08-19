import { PrismaClient, UserRole, UserStatus, Gender, PaymentMethod, PaymentStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. USERS
  const adminPassword = await hash('admin123', 10);
  const doctorPassword = await hash('doctor123', 10);
  const pharmacistPassword = await hash('pharma123', 10);
  const cashierPassword = await hash('cash123', 10);
  const clerkPassword = await hash('clerk123', 10);
  const patientPassword = await hash('patient123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      username: 'admin',
      email: 'admin@emr.com',
      password: adminPassword,
      role: UserRole.admin,
      status: UserStatus.active,
    },
  });

  const doctor = await prisma.user.create({
    data: {
      name: 'Dr. John Doe',
      username: 'doctor',
      email: 'doctor@emr.com',
      password: doctorPassword,
      role: UserRole.doctor,
      status: UserStatus.active,
    },
  });

  const pharmacist = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      username: 'pharma',
      email: 'pharma@emr.com',
      password: pharmacistPassword,
      role: UserRole.pharmacist,
      status: UserStatus.active,
    },
  });

  const cashier = await prisma.user.create({
    data: {
      name: 'Cashier One',
      username: 'cashier',
      email: 'cashier@emr.com',
      password: cashierPassword,
      role: UserRole.cashier,
      status: UserStatus.active,
    },
  });

  const clerk = await prisma.user.create({
    data: {
      name: 'Registration Clerk',
      username: 'clerk',
      email: 'clerk@emr.com',
      password: clerkPassword,
      role: UserRole.registration_clerk,
      status: UserStatus.active,
    },
  });

  const patientAlice = await prisma.user.create({
    data: {
      name: 'Alice Patient',
      username: 'alice',
      email: 'alice@emr.com',
      password: patientPassword,
      role: UserRole.patient,
      status: UserStatus.active,
    },
  });

  const patientBob = await prisma.user.create({
    data: {
      name: 'Bob Patient',
      username: 'bob',
      email: 'bob@emr.com',
      password: patientPassword,
      role: UserRole.patient,
      status: UserStatus.active,
    },
  });

  // 2. PATIENT PROFILES
  const profileAlice = await prisma.patientProfile.create({
    data: {
      userId: patientAlice.id,
      dob: new Date('1990-05-15'),
      gender: Gender.female,
      address: '123 Main St',
      phone: '1234567890',
      clerkId: clerk.id,
    },
  });

  const profileBob = await prisma.patientProfile.create({
    data: {
      userId: patientBob.id,
      dob: new Date('1985-10-20'),
      gender: Gender.male,
      address: '456 Oak St',
      phone: '9876543210',
      clerkId: clerk.id,
    },
  });

  // 3. MEDICINES
  const paracetamol = await prisma.medicine.create({
    data: {
      name: 'Paracetamol',
      dosage: '500mg',
      type: 'Tablet',
      manufacturer: 'Generic Pharma',
      stock: 100,
      price: 2000,
    },
  });

  const amoxicillin = await prisma.medicine.create({
    data: {
      name: 'Amoxicillin',
      dosage: '500mg',
      type: 'Capsule',
      manufacturer: 'HealthMed',
      stock: 200,
      price: 5000,
    },
  });

  // 4. SERVICE ITEMS
  const consultation = await prisma.serviceItem.create({
    data: {
      name: 'Doctor Consultation',
      price: 50000,
    },
  });

  const labtest = await prisma.serviceItem.create({
    data: {
      name: 'Lab Test',
      price: 150000,
    },
  });

  // 5. ALICE'S MEDICAL RECORD
  const medicalRecordAlice = await prisma.medicalRecord.create({
    data: {
      patientId: profileAlice.id,
      doctorId: doctor.id,
      clerkId: clerk.id,
      visitDate: new Date(),
      diagnosis: 'Common Cold',
      notes: 'Patient complains of cough and fever.',
    },
  });

  await prisma.record.create({
    data: {
      medicalRecordId: medicalRecordAlice.id,
      patientId: profileAlice.id,
      doctorId: doctor.id,
      subjective: 'Cough, fever, sore throat.',
      objective: 'Mild fever 38C, throat inflammation.',
      assessment: 'Likely viral infection.',
      planning: 'Prescribe Paracetamol + Amoxicillin, order blood test.',
    },
  });

  const prescriptionAlice = await prisma.prescription.create({
    data: {
      medicalRecordId: medicalRecordAlice.id,
      doctorId: doctor.id,
      pharmacistId: pharmacist.id,
      patientId: profileAlice.id,
      dateIssued: new Date(),
      notes: 'Take as prescribed.',
    },
  });

  const presAlice1 = await prisma.prescriptionItem.create({
    data: {
      prescriptionId: prescriptionAlice.id,
      medicineId: paracetamol.id,
      dosage: '500mg',
      quantity: 10,
      price: 2000,
      instructions: 'Take 3x daily after meals',
    },
  });

  const presAlice2 = await prisma.prescriptionItem.create({
    data: {
      prescriptionId: prescriptionAlice.id,
      medicineId: amoxicillin.id,
      dosage: '500mg',
      quantity: 10,
      price: 5000,
      instructions: 'Take 3x daily for 7 days',
    },
  });

  const serviceAlice = await prisma.service.create({
    data: {
      patientId: profileAlice.id,
      doctorId: doctor.id,
      medicalRecordId: medicalRecordAlice.id,
    },
  });

  const serviceAlice1 = await prisma.serviceOnServiceItem.create({
    data: {
      serviceId: serviceAlice.id,
      serviceItemId: consultation.id,
      quantity: 1,
      price: 50000,
    },
  });

  const serviceAlice2 = await prisma.serviceOnServiceItem.create({
    data: {
      serviceId: serviceAlice.id,
      serviceItemId: labtest.id,
      quantity: 1,
      price: 150000,
    },
  });

  const paymentAlice = await prisma.payment.create({
    data: {
      medicalRecordId: medicalRecordAlice.id,
      patientId: profileAlice.id,
      status: PaymentStatus.paid,
      method: PaymentMethod.cash,
      date: new Date(),
      totalAmount:
        presAlice1.price * presAlice1.quantity +
        presAlice2.price * presAlice2.quantity +
        serviceAlice1.price +
        serviceAlice2.price,
    },
  });

  await prisma.paymentItem.createMany({
    data: [
      {
        paymentId: paymentAlice.id,
        description: 'Paracetamol 500mg',
        amount: presAlice1.price * presAlice1.quantity,
        prescriptionItemId: presAlice1.id,
      },
      {
        paymentId: paymentAlice.id,
        description: 'Amoxicillin 500mg',
        amount: presAlice2.price * presAlice2.quantity,
        prescriptionItemId: presAlice2.id,
      },
      {
        paymentId: paymentAlice.id,
        description: 'Doctor Consultation',
        amount: serviceAlice1.price,
        serviceOnServiceItemId: serviceAlice1.id,
      },
      {
        paymentId: paymentAlice.id,
        description: 'Lab Test',
        amount: serviceAlice2.price,
        serviceOnServiceItemId: serviceAlice2.id,
      },
    ],
  });

  // 6. BOB'S MEDICAL RECORD
  const medicalRecordBob = await prisma.medicalRecord.create({
    data: {
      patientId: profileBob.id,
      doctorId: doctor.id,
      clerkId: clerk.id,
      visitDate: new Date(),
      diagnosis: 'Gastritis',
      notes: 'Patient complains of stomach pain.',
    },
  });

  await prisma.record.create({
    data: {
      medicalRecordId: medicalRecordBob.id,
      patientId: profileBob.id,
      doctorId: doctor.id,
      subjective: 'Stomach pain, nausea.',
      objective: 'Tenderness in epigastric region.',
      assessment: 'Likely gastritis.',
      planning: 'Prescribe antacid, advise dietary changes.',
    },
  });

  const prescriptionBob = await prisma.prescription.create({
    data: {
      medicalRecordId: medicalRecordBob.id,
      doctorId: doctor.id,
      pharmacistId: pharmacist.id,
      patientId: profileBob.id,
      dateIssued: new Date(),
      notes: 'Take as prescribed.',
    },
  });

  const presBob1 = await prisma.prescriptionItem.create({
    data: {
      prescriptionId: prescriptionBob.id,
      medicineId: paracetamol.id,
      dosage: '500mg',
      quantity: 5,
      price: 2000,
      instructions: 'Take if fever occurs',
    },
  });

  const serviceBob = await prisma.service.create({
    data: {
      patientId: profileBob.id,
      doctorId: doctor.id,
      medicalRecordId: medicalRecordBob.id,
    },
  });

  const serviceBob1 = await prisma.serviceOnServiceItem.create({
    data: {
      serviceId: serviceBob.id,
      serviceItemId: consultation.id,
      quantity: 1,
      price: 50000,
    },
  });

  const paymentBob = await prisma.payment.create({
    data: {
      medicalRecordId: medicalRecordBob.id,
      patientId: profileBob.id,
      status: PaymentStatus.paid,
      method: PaymentMethod.cash,
      date: new Date(),
      totalAmount: presBob1.price * presBob1.quantity + serviceBob1.price,
    },
  });

  await prisma.paymentItem.createMany({
    data: [
      {
        paymentId: paymentBob.id,
        description: 'Paracetamol 500mg',
        amount: presBob1.price * presBob1.quantity,
        prescriptionItemId: presBob1.id,
      },
      {
        paymentId: paymentBob.id,
        description: 'Doctor Consultation',
        amount: serviceBob1.price,
        serviceOnServiceItemId: serviceBob1.id,
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