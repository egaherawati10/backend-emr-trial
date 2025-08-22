import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DoctorPatientPolicy {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ensure the doctor has an *open* medical record with this patient.
   * Returns the medicalRecord if found; otherwise throws.
   */
  async assertDoctorTreatingPatient(doctorUserId: number, patientProfileId: number) {
    const record = await this.prisma.medicalRecord.findFirst({
      where: {
        patientId: patientProfileId,
        doctorId: doctorUserId,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) {
      throw new ForbiddenException('You are not the treating doctor for this patient (no open visit).');
    }
    return record;
  }
}