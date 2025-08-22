import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PatientHubService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertPatientScope(user: { id: number; role: string }, patientId: number) {
    if (user.role !== 'patient') return;
    const me = await this.prisma.patientProfile.findFirst({
      where: { userId: user.id, deletedAt: null },
      select: { id: true },
    });
    if (!me || me.id !== patientId) throw new NotFoundException('Patient not found');
  }

  /** GET /patients/:patientId/services */
  async listServicesForPatient(user: { id: number; role: string }, patientId: number, page: number, limit: number) {
    await this.assertPatientScope(user, patientId);

    const where: Prisma.ServiceWhereInput = { patientId, deletedAt: null };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where,
        orderBy: { serviceDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, code: true, patientId: true, doctorId: true, medicalRecordId: true,
          status: true, serviceDate: true, createdAt: true, updatedAt: true,
          // Optional: include lines summary (count)
          _count: { select: { serviceItems: true } },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    // (Optional) derive totals per service (sum quantity*unitPrice)
    // Keep it simple & precise; optimize later if needed
    const ids = rows.map(r => r.id);
    const lines = await this.prisma.serviceOnServiceItem.findMany({
      where: { serviceId: { in: ids } },
      select: { serviceId: true, quantity: true, unitPrice: true },
    });
    const totals = new Map<number, Prisma.Decimal>();
    for (const l of lines) {
      const prev = totals.get(l.serviceId) ?? new Prisma.Decimal(0);
      totals.set(l.serviceId, prev.add((l.unitPrice as any).mul(l.quantity)));
    }

    const data = rows.map(r => ({
      ...r,
      totalAmount: totals.get(r.id) ?? new Prisma.Decimal(0),
    }));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  /** GET /patients/:patientId/payments */
  async listPaymentsForPatient(user: { id: number; role: string }, patientId: number, page: number, limit: number) {
    await this.assertPatientScope(user, patientId);

    const where: Prisma.PaymentWhereInput = { patientId, deletedAt: null };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        orderBy: { issuedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, code: true, medicalRecordId: true, patientId: true,
          status: true, method: true, issuedAt: true, paidAt: true,
          totalAmount: true, createdAt: true, updatedAt: true,
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }
}