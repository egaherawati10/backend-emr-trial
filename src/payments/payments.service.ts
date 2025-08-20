import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import { Payment, PaymentItem, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IPaymentsService, IncludeParam, Actor } from './payments.service.interface';
import { PaymentsRepository, buildPaymentInclude } from './payments.repository';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreatePaymentItemDto } from './items/dto/create-payment-item.dto';
import { UpdatePaymentItemDto } from './items/dto/update-payment-item.dto';

@Injectable()
export class PaymentsService implements IPaymentsService {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ---------------- helpers ----------------
  private toDateOrThrow(iso: string, field: string): Date {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) throw new BadRequestException(`${field} must be a valid ISO-8601 date string`);
    return d;
  }

  private async resolvePatientProfileIdOrThrow(userId: number): Promise<number> {
    const pp = await this.prisma.patientProfile.findUnique({ where: { userId } });
    if (!pp) throw new ForbiddenException('No patient profile found for this user.');
    return pp.id;
  }

  private async verifyPaymentContextOrThrow(medicalRecordId: number, patientId: number) {
    const mr = await this.prisma.medicalRecord.findUnique({ where: { id: medicalRecordId } });
    if (!mr) throw new NotFoundException(`MedicalRecord ${medicalRecordId} not found`);
    if (mr.patientId !== patientId) {
      throw new BadRequestException('patientId does not match the MedicalRecord.patientId');
    }
  }

  private handlePrisma(err: unknown, ctx: string): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const target = Array.isArray((err as any).meta?.target) ? (err as any).meta?.target.join(', ') : String((err as any).meta?.target ?? '');
      switch (err.code) {
        case 'P2002': throw new ConflictException(`Unique constraint failed${target ? ` on: ${target}` : ''}`);
        case 'P2003': throw new BadRequestException('Invalid reference; foreign key constraint would be violated.');
        case 'P2025': throw new NotFoundException((err as any).meta?.cause ?? 'Record not found');
        case 'P2000': throw new BadRequestException('One of the provided values is too long for its column.');
        case 'P2011': throw new BadRequestException(`Null constraint violation${target ? ` on: ${target}` : ''}`);
        case 'P2014': throw new BadRequestException('Relation constraint violation.');
        default: throw new BadRequestException(`Database error (${err.code}) while ${ctx}.`);
      }
    }
    if (err instanceof Prisma.PrismaClientValidationError) throw new BadRequestException('Invalid data shape.');
    throw new InternalServerErrorException(`Unexpected error while ${ctx}.`);
  }

  private async recalcAndPersistTotal(paymentId: number): Promise<void> {
    const sum = await this.prisma.paymentItem.aggregate({
      where: { paymentId },
      _sum: { amount: true },
    });
    const total = sum._sum.amount ?? 0;
    await this.repo.update(paymentId, { totalAmount: total });
  }

  /** Accept null/undefined FKs and normalize inside. */
  private async computeLinkedAmountOrThrow(dto: {
    prescriptionItemId?: number | null;
    serviceOnServiceItemId?: number | null;
    amount?: number | null;
  }): Promise<number> {
    const prescId = dto.prescriptionItemId ?? undefined;
    const sosiId  = dto.serviceOnServiceItemId ?? undefined;

    if (prescId && sosiId) {
      throw new BadRequestException('Provide only one of prescriptionItemId or serviceOnServiceItemId.');
    }
    if (prescId) {
      const pi = await this.prisma.prescriptionItem.findUnique({
        where: { id: prescId },
        include: { prescription: true },
      });
      if (!pi) throw new NotFoundException(`PrescriptionItem ${prescId} not found`);
      return (dto.amount ?? (pi.price * pi.quantity));
    }
    if (sosiId) {
      const si = await this.prisma.serviceOnServiceItem.findUnique({
        where: { id: sosiId },
        include: { service: true },
      });
      if (!si) throw new NotFoundException(`ServiceOnServiceItem ${sosiId} not found`);
      return (dto.amount ?? (si.price * si.quantity));
    }
    if (dto.amount === undefined || dto.amount === null) {
      throw new BadRequestException('amount is required when no linked item is provided.');
    }
    return dto.amount;
  }

  private async validateItemBelongsToPaymentContextOrThrow(
    payment: Payment,
    links: { prescriptionItemId?: number | null; serviceOnServiceItemId?: number | null },
  ) {
    const prescId = links.prescriptionItemId ?? undefined;
    const sosiId  = links.serviceOnServiceItemId ?? undefined;

    if (prescId) {
      const pi = await this.prisma.prescriptionItem.findUnique({
        where: { id: prescId },
        include: { prescription: true },
      });
      if (!pi) throw new NotFoundException(`PrescriptionItem ${prescId} not found`);
      const pres = pi.prescription;
      if (pres.medicalRecordId !== payment.medicalRecordId) throw new BadRequestException('Linked prescription item does not belong to the same MedicalRecord as this payment.');
      if (pres.patientId !== payment.patientId) throw new BadRequestException('Linked prescription item does not belong to the same patient as this payment.');
    }
    if (sosiId) {
      const sosi = await this.prisma.serviceOnServiceItem.findUnique({
        where: { id: sosiId },
        include: { service: true },
      });
      if (!sosi) throw new NotFoundException(`ServiceOnServiceItem ${sosiId} not found`);
      const svc = sosi.service;
      if (svc.medicalRecordId !== payment.medicalRecordId) throw new BadRequestException('Linked service line does not belong to the same MedicalRecord as this payment.');
      if (svc.patientId !== payment.patientId) throw new BadRequestException('Linked service line does not belong to the same patient as this payment.');
    }
  }

  // ---------------- CRUD ----------------

  async list(query: QueryPaymentDto, actor: Actor) {
    try {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 20;

      let where: Prisma.PaymentWhereInput = {
        ...(query.medicalRecordId ? { medicalRecordId: query.medicalRecordId } : {}),
        ...(query.patientId ? { patientId: query.patientId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.method ? { method: query.method } : {}),
        ...(query.dateFrom || query.dateTo ? {
          date: {
            ...(query.dateFrom ? { gte: this.toDateOrThrow(query.dateFrom, 'dateFrom') } : {}),
            ...(query.dateTo ? { lte: this.toDateOrThrow(query.dateTo, 'dateTo') } : {}),
          },
        } : {}),
      };

      // Patient scoping
      if (actor.role === 'patient') {
        const patientProfileId = await this.resolvePatientProfileIdOrThrow(actor.userId);
        where = { ...where, patientId: patientProfileId };
      }

      const orderBy: Prisma.PaymentOrderByWithRelationInput = { date: 'desc' };
      const include = buildPaymentInclude(query.includeAll ? true : query.include);

      const [data, total] = await Promise.all([
        this.repo.findMany({ skip: (page - 1) * pageSize, take: pageSize, where, orderBy, include }),
        this.repo.count(where),
      ]);

      return { data, total, page, pageSize };
    } catch (err) {
      this.handlePrisma(err, 'listing payments');
    }
  }

  async getById(id: number, include?: IncludeParam, actor?: Actor): Promise<Payment> {
    try {
      const p = await this.repo.findById(id, buildPaymentInclude(include));
      if (!p) throw new NotFoundException(`Payment ${id} not found`);

      if (actor?.role === 'patient') {
        const patientProfileId = await this.resolvePatientProfileIdOrThrow(actor.userId);
        if (p.patientId !== patientProfileId) throw new ForbiddenException('You can only view your own payments.');
      }

      return p;
    } catch (err) {
      this.handlePrisma(err, `getting Payment ${id}`);
    }
  }

  async create(dto: CreatePaymentDto, include?: IncludeParam): Promise<Payment> {
    try {
      await this.verifyPaymentContextOrThrow(dto.medicalRecordId, dto.patientId);

      const data: Prisma.PaymentUncheckedCreateInput = {
        medicalRecordId: dto.medicalRecordId,
        patientId: dto.patientId,
        status: dto.status,
        method: dto.method,
        date: this.toDateOrThrow(dto.date, 'date'),
        totalAmount: 0, // will be recalculated when items are added
      };
      return await this.repo.create(data, buildPaymentInclude(include));
    } catch (err) {
      this.handlePrisma(err, 'creating a payment');
    }
  }

  async update(id: number, dto: UpdatePaymentDto, include?: IncludeParam): Promise<Payment> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NotFoundException(`Payment ${id} not found`);

      const data: Prisma.PaymentUncheckedUpdateInput = {};
      if (dto.status !== undefined) data.status = dto.status;
      if (dto.method !== undefined) data.method = dto.method;
      if (dto.date !== undefined) data.date = this.toDateOrThrow(dto.date, 'date');

      return await this.repo.update(id, data, buildPaymentInclude(include));
    } catch (err) {
      this.handlePrisma(err, `updating Payment ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.repo.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('Cannot delete Payment because dependent items exist.');
      }
      this.handlePrisma(err, `deleting Payment ${id}`);
    }
  }

  // ---------------- Items ----------------

  async addItem(paymentId: number, dto: CreatePaymentItemDto): Promise<PaymentItem> {
    try {
      const payment = await this.repo.findById(paymentId);
      if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);

      await this.validateItemBelongsToPaymentContextOrThrow(payment, {
        prescriptionItemId: dto.prescriptionItemId ?? undefined,
        serviceOnServiceItemId: dto.serviceOnServiceItemId ?? undefined,
      });

      const amount = await this.computeLinkedAmountOrThrow(dto);

      const data: Prisma.PaymentItemUncheckedCreateInput = {
        paymentId,
        description: dto.description,
        amount,
        ...(dto.prescriptionItemId !== undefined ? { prescriptionItemId: dto.prescriptionItemId } : {}),
        ...(dto.serviceOnServiceItemId !== undefined ? { serviceOnServiceItemId: dto.serviceOnServiceItemId } : {}),
      };

      const created = await this.repo.createItem(data);
      await this.recalcAndPersistTotal(paymentId);
      return created;
    } catch (err) {
      this.handlePrisma(err, `adding item to Payment ${paymentId}`);
    }
  }

  async updateItem(paymentId: number, itemId: number, dto: UpdatePaymentItemDto): Promise<PaymentItem> {
    try {
      const item = await this.repo.findItemById(itemId);
      if (!item) throw new NotFoundException(`PaymentItem ${itemId} not found`);
      if (item.paymentId !== paymentId) throw new ForbiddenException('Item does not belong to this payment');

      const payment = await this.repo.findById(paymentId);
      if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);

      // Normalize current DB links (null -> undefined)
      const currentPrescId = item.prescriptionItemId ?? undefined;
      const currentSosiId  = item.serviceOnServiceItemId ?? undefined;

      // Desired links from DTO:
      //  - undefined => keep current
      //  - null      => explicit unlink (we’ll write null to DB)
      const nextPrescId = dto.prescriptionItemId === undefined ? currentPrescId : (dto.prescriptionItemId ?? undefined);
      const nextSosiId  = dto.serviceOnServiceItemId === undefined ? currentSosiId  : (dto.serviceOnServiceItemId  ?? undefined);

      if (nextPrescId && nextSosiId) {
        throw new BadRequestException('Provide only one of prescriptionItemId or serviceOnServiceItemId.');
      }

      await this.validateItemBelongsToPaymentContextOrThrow(payment, {
        prescriptionItemId: nextPrescId,
        serviceOnServiceItemId: nextSosiId,
      });

      // Determine amount
      let nextAmount: number | undefined;
      if (dto.amount === null) {
        if (!nextPrescId && !nextSosiId) {
          throw new BadRequestException('Cannot recompute amount without a linked item.');
        }
        nextAmount = await this.computeLinkedAmountOrThrow({
          prescriptionItemId: nextPrescId,
          serviceOnServiceItemId: nextSosiId,
          amount: undefined,
        });
      } else if (dto.amount === undefined) {
        const linkChanged = nextPrescId !== currentPrescId || nextSosiId !== currentSosiId;
        if (linkChanged) {
          nextAmount = await this.computeLinkedAmountOrThrow({
            prescriptionItemId: nextPrescId,
            serviceOnServiceItemId: nextSosiId,
            amount: undefined,
          });
        }
      } else {
        nextAmount = dto.amount; // explicit
      }

      const data: Prisma.PaymentItemUncheckedUpdateInput = {};
      if (dto.description !== undefined) data.description = dto.description;
      if (nextPrescId !== currentPrescId) data.prescriptionItemId = nextPrescId ?? null; // null unlinks in DB
      if (nextSosiId  !== currentSosiId)  data.serviceOnServiceItemId = nextSosiId ?? null;
      if (nextAmount !== undefined)       data.amount = nextAmount;

      const updated = await this.repo.updateItem(itemId, data);
      await this.recalcAndPersistTotal(paymentId);
      return updated;
    } catch (err) {
      this.handlePrisma(err, `updating item ${itemId} on Payment ${paymentId}`);
    }
  }

  async removeItem(paymentId: number, itemId: number): Promise<void> {
    try {
      const item = await this.repo.findItemById(itemId);
      if (!item) throw new NotFoundException(`PaymentItem ${itemId} not found`);
      if (item.paymentId !== paymentId) throw new ForbiddenException('Item does not belong to this payment');

      await this.repo.deleteItem(itemId);
      await this.recalcAndPersistTotal(paymentId);
    } catch (err) {
      this.handlePrisma(err, `deleting item ${itemId} on Payment ${paymentId}`);
    }
  }
}