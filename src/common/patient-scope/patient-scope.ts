import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '../auth/capabilities';

export type Actor = { id: number; role: Role };

export class PatientScope {
  static async ensurePatientExists(tx: PrismaService, patientId: number) {
    const p = await tx.patientProfile.findUnique({ where: { id: patientId }, select: { id: true } });
    if (!p) throw new NotFoundException('Patient not found');
  }

  static async ensureMedicalRecordBelongsToPatient(
    tx: PrismaService,
    medicalRecordId: number,
    patientId: number,
  ) {
    const mr = await tx.medicalRecord.findUnique({
      where: { id: medicalRecordId },
      select: { id: true, patientId: true, doctorId: true, clerkId: true },
    });
    if (!mr) throw new NotFoundException('Medical record not found');
    if (mr.patientId !== patientId) throw new ForbiddenException('Record not tied to patient');
    return mr;
  }

  static ensureDoctorOwnsRecord(actor: Actor, mr: { doctorId: number }) {
    if (actor.role !== 'doctor') return;
    if (mr.doctorId !== actor.id) {
      throw new ForbiddenException('Doctor can only modify records they authored');
    }
  }

  static ensurePharmacistOwnsPrescription(actor: Actor, rx: { pharmacistId: number | null }) {
    if (actor.role !== 'pharmacist') return;
    if (rx.pharmacistId && rx.pharmacistId !== actor.id) {
      throw new ForbiddenException('Prescription assigned to a different pharmacist');
    }
  }

  static ensureCashierOwnsPayment(actor: Actor, _payment: unknown) {
    // Your schema doesn’t store cashierId on Payment. RBAC will allow the cashier role,
    // but you *can’t* prove ownership. Consider adding cashierId (auditing) if you need it.
  }
}