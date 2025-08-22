import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { Prisma, PrismaClient, PaymentItemKind } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from './dto/common.dto';
import { CreateRecordDto } from './dto/record.dto';
import { CreatePrescriptionDto } from './dto/prescription.dto';
import { CreateServiceDto } from './dto/service.dto';
import { CreatePaymentDto } from './dto/payment.dto';
import { canDo, Role } from '@/common/auth/capabilities';

@Injectable()
export class PatientHubService {
  constructor(private readonly prisma: PrismaService) {}

  // ------- helpers -------
  private assert(cond: any, msg: string, error = BadRequestException) {
    if (!cond) throw new error(msg);
  }

  private async mustGetPatientProfile(patientId: number) {
    const p = await this.prisma.patientProfile.findUnique({ where: { id: patientId } });
    if (!p) throw new NotFoundException('Patient not found');
    return p;
  }

  private async ensureMrBelongs(patientId: number, medicalRecordId: number) {
    const mr = await this.prisma.medicalRecord.findUnique({
      where: { id: medicalRecordId },
      select: { id: true, patientId: true, doctorId: true },
    });
    if (!mr || mr.patientId !== patientId) {
      throw new ForbiddenException('MedicalRecord does not belong to this patient');
    }
    return mr;
  }

  private require(role: Role, resource: Parameters<typeof canDo>[1], action: Parameters<typeof canDo>[2]) {
    if (!canDo(role, resource, action)) throw new ForbiddenException(`Not allowed: ${role} ${action} ${resource}`);
  }

  // ------- summary -------
  async getSummary(patientId: number) {
    await this.mustGetPatientProfile(patientId);
    const [patient, latestMR, counts, balances] = await this.prisma.$transaction([
      this.prisma.patientProfile.findUnique({
        where: { id: patientId },
        include: { user: { select: { name: true, email: true } } },
      }),
      this.prisma.medicalRecord.findFirst({
        where: { patientId },
        orderBy: { visitDate: 'desc' },
        include: {
          records: { take: 1, orderBy: { id: 'desc' } },
          prescriptions: { take: 1, orderBy: { id: 'desc' } },
        },
      }),
      this.prisma.$queryRaw<{ table: string; count: bigint }[]>`
        select 'records' as table, count(*)::bigint from "Record" where "patientId" = ${patientId}
        union all
        select 'prescriptions', count(*)::bigint from "Prescription" where "patientId" = ${patientId}
        union all
        select 'services', count(*)::bigint from "Service" where "patientId" = ${patientId}
        union all
        select 'payments', count(*)::bigint from "Payment" where "patientId" = ${patientId}
      `,
      this.prisma.payment.groupBy({
        by: ['status'],
        where: { patientId },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      patient,
      latestMedicalRecord: latestMR,
      counts: Object.fromEntries(counts.map(c => [c.table, Number(c.count)])),
      paymentSums: balances.map(b => ({ status: b.status, total: b._sum.totalAmount?.toString() ?? '0' })),
    };
  }

  // ------- listings -------
  private paginate<T>(page: number, limit: number) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    return { take, skip };
  }

  async listRecords(patientId: number, q: PaginationDto) {
    await this.mustGetPatientProfile(patientId);
    const { take, skip } = this.paginate(q.page, q.limit);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.record.findMany({
        where: { patientId },
        orderBy: { id: 'desc' },
        take, skip,
      }),
      this.prisma.record.count({ where: { patientId } }),
    ]);
    return { items, total, page: q.page, limit: q.limit };
    }

  async listPrescriptions(patientId: number, q: PaginationDto) {
    await this.mustGetPatientProfile(patientId);
    const { take, skip } = this.paginate(q.page, q.limit);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.prescription.findMany({
        where: { patientId },
        include: { items: true },
        orderBy: { id: 'desc' },
        take, skip,
      }),
      this.prisma.prescription.count({ where: { patientId } }),
    ]);
    return { items, total, page: q.page, limit: q.limit };
  }

  async listServices(patientId: number, q: PaginationDto) {
    await this.mustGetPatientProfile(patientId);
    const { take, skip } = this.paginate(q.page, q.limit);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where: { patientId },
        include: { serviceItems: { include: { serviceItem: true } } },
        orderBy: { id: 'desc' },
        take, skip,
      }),
      this.prisma.service.count({ where: { patientId } }),
    ]);
    return { items, total, page: q.page, limit: q.limit };
  }

  async listPayments(
    patientId: number,
    q: PaginationDto & { from?: string; to?: string },
  ) {
    await this.mustGetPatientProfile(patientId);
    const { take, skip } = this.paginate(q.page, q.limit);
    const where: Prisma.PaymentWhereInput = {
      patientId,
      issuedAt: q.from || q.to ? {
        gte: q.from ? new Date(q.from) : undefined,
        lte: q.to ? new Date(q.to) : undefined,
      } : undefined,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        include: { items: true },
        orderBy: { id: 'desc' },
        take, skip,
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { items, total, page: q.page, limit: q.limit };
  }

  // ------- creates -------
  async createRecord(patientId: number, dto: CreateRecordDto, me: { id: number; role: Role }) {
    this.require(me.role, 'Record', 'create');
    await this.mustGetPatientProfile(patientId);
    const mr = await this.ensureMrBelongs(patientId, dto.medicalRecordId);

    return this.prisma.record.create({
      data: {
        medicalRecordId: mr.id,
        patientId,
        doctorId: mr.doctorId,
        subjective: dto.subjective,
        objective: dto.objective,
        assessment: dto.assessment,
        planning: dto.planning,
        createdById: me.id,
        updatedById: me.id,
      },
    });
  }

  async createPrescription(patientId: number, dto: CreatePrescriptionDto, me: { id: number; role: Role }) {
    this.require(me.role, 'Prescription', 'create');
    await this.mustGetPatientProfile(patientId);
    const mr = await this.ensureMrBelongs(patientId, dto.medicalRecordId);

    // load medicine prices
    const medIds = dto.items.map(i => i.medicineId);
    const meds = await this.prisma.medicine.findMany({ where: { id: { in: medIds } } });
    const medMap = new Map(meds.map(m => [m.id, m]));

    const rx = await this.prisma.prescription.create({
      data: {
        medicalRecordId: mr.id,
        doctorId: mr.doctorId,
        pharmacistId: null,
        patientId,
        notes: dto.notes,
        createdById: me.id,
        updatedById: me.id,
        items: {
          create: dto.items.map(i => {
            const med = medMap.get(i.medicineId);
            if (!med) throw new BadRequestException(`Medicine ${i.medicineId} not found`);
            const price = i.price ? new Prisma.Decimal(i.price) : new Prisma.Decimal(med.price.toString());
            return {
              medicineId: i.medicineId,
              dosage: i.dosage,
              quantity: i.quantity,
              price,
              instructions: i.instructions ?? null,
            };
          }),
        },
      },
      include: { items: true },
    });

    return rx;
  }

  async createService(patientId: number, dto: CreateServiceDto, me: { id: number; role: Role }) {
    this.require(me.role, 'Service', 'create');
    await this.mustGetPatientProfile(patientId);
    const mr = await this.ensureMrBelongs(patientId, dto.medicalRecordId);

    const catalog = await this.prisma.serviceItem.findMany({
      where: { id: { in: dto.items.map(i => i.serviceItemId) } },
    });
    const map = new Map(catalog.map(c => [c.id, c]));

    return this.prisma.service.create({
      data: {
        patientId,
        doctorId: mr.doctorId,
        medicalRecordId: mr.id,
        createdById: me.id,
        updatedById: me.id,
        serviceItems: {
          create: dto.items.map(i => {
            const item = map.get(i.serviceItemId);
            if (!item) throw new BadRequestException(`ServiceItem ${i.serviceItemId} not found`);
            return {
              serviceItemId: item.id,
              quantity: i.quantity,
              unitPrice: new Prisma.Decimal(item.price.toString()),
            };
          }),
        },
      },
      include: { serviceItems: { include: { serviceItem: true } } },
    });
  }

  async createPayment(patientId: number, dto: CreatePaymentDto, me: { id: number; role: Role }) {
    this.require(me.role, 'Payment', 'create');
    await this.mustGetPatientProfile(patientId);
    await this.ensureMrBelongs(patientId, dto.medicalRecordId);

    // Preload sources to compute amounts if not provided
    const rxItemIds = dto.items.filter(i => i.kind === PaymentItemKind.prescription_item && i.prescriptionItemId)
                               .map(i => i.prescriptionItemId!) ;
    const svcLineIds = dto.items.filter(i => i.kind === PaymentItemKind.service_item && i.serviceOnServiceItemId)
                                .map(i => i.serviceOnServiceItemId!) ;

    const [rxItems, svcLines] = await this.prisma.$transaction([
      rxItemIds.length ? this.prisma.prescriptionItem.findMany({ where: { id: { in: rxItemIds } } }) : Promise.resolve([]),
      svcLineIds.length ? this.prisma.serviceOnServiceItem.findMany({ where: { id: { in: svcLineIds } } }) : Promise.resolve([]),
    ]);
    const rxMap = new Map(rxItems.map(x => [x.id, x]));
    const svcMap = new Map(svcLines.map(x => [x.id, x]));

    // Build nested items + compute totals
    const nestedItems = dto.items.map(i => {
      const oneOf = Number(!!i.prescriptionItemId) + Number(!!i.serviceOnServiceItemId);
      if (oneOf !== 1) throw new BadRequestException('Each payment item must reference exactly one source');

      let amount = i.amount ? new Prisma.Decimal(i.amount) : undefined;
      if (!amount) {
        if (i.kind === PaymentItemKind.prescription_item) {
          const src = rxMap.get(i.prescriptionItemId!);
          if (!src) throw new BadRequestException(`PrescriptionItem ${i.prescriptionItemId} not found`);
          amount = new Prisma.Decimal(src.price.toString()).mul(src.quantity);
        } else {
          const src = svcMap.get(i.serviceOnServiceItemId!);
          if (!src) throw new BadRequestException(`ServiceOnServiceItem ${i.serviceOnServiceItemId} not found`);
          amount = new Prisma.Decimal(src.unitPrice.toString()).mul(src.quantity);
        }
      }

      return {
        kind: i.kind,
        description: i.description ?? (i.kind === 'prescription_item' ? `RX item ${i.prescriptionItemId}` : `Service line ${i.serviceOnServiceItemId}`),
        amount,
        prescriptionItemId: i.prescriptionItemId ?? null,
        serviceOnServiceItemId: i.serviceOnServiceItemId ?? null,
      };
    });

    const subtotal = nestedItems.reduce((acc, it) => acc.add(it.amount!), new Prisma.Decimal(0));
    const discount = new Prisma.Decimal(0);
    const tax = new Prisma.Decimal(0);
    const total = subtotal.minus(discount).plus(tax);

    return this.prisma.payment.create({
      data: {
        medicalRecordId: dto.medicalRecordId,
        patientId,
        method: dto.method,
        status: 'pending',
        subtotal, discount, tax, totalAmount: total,
        createdById: me.id, updatedById: me.id,
        items: { create: nestedItems },
      },
      include: { items: true },
    });
  }
}