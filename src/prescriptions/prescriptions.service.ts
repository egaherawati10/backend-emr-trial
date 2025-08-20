import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import { Prisma, Prescription, PrescriptionItem } from '@prisma/client';
import { PrescriptionsRepository, buildPrescriptionInclude } from './prescriptions.repository';
import { QueryPrescriptionDto } from './dto/query-prescription.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { CreatePrescriptionItemDto } from './items/dto/create-prescription-item.dto';
import { UpdatePrescriptionItemDto } from './items/dto/update-prescription-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { IncludeParam, IPrescriptionsService } from './prescriptions.service.interface';

@Injectable()
export class PrescriptionsService implements IPrescriptionsService {
  constructor(
    private readonly repo: PrescriptionsRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ---- helpers
  private toDateOrThrow(iso: string, field: string): Date {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) throw new BadRequestException(`${field} must be a valid ISO-8601 date string`);
    return d;
  }
  private setIfDefined<T extends object>(o: T, k: string, v: unknown) {
    if (v !== undefined) (o as any)[k] = v;
  }

  private handlePrisma(err: unknown, ctx: string): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const target = Array.isArray((err as any).meta?.target)
        ? (err as any).meta?.target.join(', ')
        : String((err as any).meta?.target ?? '');
      switch (err.code) {
        case 'P2002': throw new ConflictException(`Unique constraint failed${target ? ` on: ${target}` : ''}`);
        case 'P2003': throw new BadRequestException('Invalid reference; foreign key constraint would be violated.');
        case 'P2025': throw new NotFoundException((err as any).meta?.cause ?? 'Record not found');
        default: throw new BadRequestException(`Database error (${err.code}) while ${ctx}.`);
      }
    }
    if (err instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException('Invalid data shape.');
    }
    throw new InternalServerErrorException(`Unexpected error while ${ctx}.`);
  }

  // ---- CRUD
  async list(query: QueryPrescriptionDto) {
    try {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 20;
      const where: Prisma.PrescriptionWhereInput = {
        ...(query.medicalRecordId ? { medicalRecordId: query.medicalRecordId } : {}),
        ...(query.doctorId ? { doctorId: query.doctorId } : {}),
        ...(query.pharmacistId ? { pharmacistId: query.pharmacistId } : {}), // optional FK
        ...(query.patientId ? { patientId: query.patientId } : {}),
        ...(query.issuedFrom || query.issuedTo
          ? {
              dateIssued: {
                ...(query.issuedFrom ? { gte: this.toDateOrThrow(query.issuedFrom, 'issuedFrom') } : {}),
                ...(query.issuedTo ? { lte: this.toDateOrThrow(query.issuedTo, 'issuedTo') } : {}),
              },
            }
          : {}),
      };
      const orderBy: Prisma.PrescriptionOrderByWithRelationInput = {
        [query.sortBy ?? 'dateIssued']: query.sortOrder ?? 'desc',
      };
      const include = buildPrescriptionInclude(query.includeAll ? true : query.include);

      const [data, total] = await Promise.all([
        this.repo.findMany({ skip: (page - 1) * pageSize, take: pageSize, where, orderBy, include }),
        this.repo.count(where),
      ]);

      return { data, total, page, pageSize };
    } catch (err) {
      this.handlePrisma(err, 'listing prescriptions');
    }
  }

  async getById(id: number, include?: IncludeParam): Promise<Prescription> {
    try {
      const p = await this.repo.findById(id, buildPrescriptionInclude(include));
      if (!p) throw new NotFoundException(`Prescription ${id} not found`);
      return p;
    } catch (err) {
      this.handlePrisma(err, `getting Prescription ${id}`);
    }
  }

  async create(dto: CreatePrescriptionDto, include?: IncludeParam): Promise<Prescription> {
    try {
      const data: Prisma.PrescriptionUncheckedCreateInput = {
        medicalRecordId: dto.medicalRecordId,
        doctorId: dto.doctorId,
        patientId: dto.patientId,
        dateIssued: this.toDateOrThrow(dto.dateIssued, 'dateIssued'),
        notes: dto.notes,
        // pharmacistId is OPTIONAL: add only when present
        ...(dto.pharmacistId !== undefined ? { pharmacistId: dto.pharmacistId } : {}),
      };
      return await this.repo.create(data, buildPrescriptionInclude(include));
    } catch (err) {
      this.handlePrisma(err, 'creating a prescription');
    }
  }

  async update(id: number, dto: UpdatePrescriptionDto, include?: IncludeParam): Promise<Prescription> {
    try {
      await this.getById(id);
      const data: Prisma.PrescriptionUncheckedUpdateInput = {};
      this.setIfDefined(data, 'medicalRecordId', dto.medicalRecordId);
      this.setIfDefined(data, 'doctorId', dto.doctorId);
      this.setIfDefined(data, 'pharmacistId', dto.pharmacistId); // number or null or omitted
      this.setIfDefined(data, 'patientId', dto.patientId);
      if (dto.dateIssued !== undefined) {
        this.setIfDefined(data, 'dateIssued', this.toDateOrThrow(dto.dateIssued, 'dateIssued'));
      }
      this.setIfDefined(data, 'notes', dto.notes);
      return await this.repo.update(id, data, buildPrescriptionInclude(include));
    } catch (err) {
      this.handlePrisma(err, `updating Prescription ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.repo.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('Cannot delete Prescription because dependent items/payments exist.');
      }
      this.handlePrisma(err, `deleting Prescription ${id}`);
    }
  }

  // ---- Items (child of prescription)
  async addItem(prescriptionId: number, dto: CreatePrescriptionItemDto): Promise<PrescriptionItem> {
    try {
      // ensure parent exists
      await this.getById(prescriptionId);

      // resolve price if omitted
      let price = dto.price;
      if (price === undefined) {
        const med = await this.prisma.medicine.findUnique({ where: { id: dto.medicineId } });
        if (!med) throw new NotFoundException(`Medicine ${dto.medicineId} not found`);
        price = med.price;
      }

      const data: Prisma.PrescriptionItemUncheckedCreateInput = {
        prescriptionId,
        medicineId: dto.medicineId,
        dosage: dto.dosage,
        quantity: dto.quantity,
        price,
        instructions: dto.instructions,
      };
      return await this.repo.createItem(data);
    } catch (err) {
      this.handlePrisma(err, `adding item to Prescription ${prescriptionId}`);
    }
  }

  async updateItem(prescriptionId: number, itemId: number, dto: UpdatePrescriptionItemDto): Promise<PrescriptionItem> {
    try {
      const item = await this.repo.findItemById(itemId);
      if (!item) throw new NotFoundException(`PrescriptionItem ${itemId} not found`);
      if (item.prescriptionId !== prescriptionId) {
        throw new ForbiddenException('Item does not belong to this Prescription');
      }

      const data: Prisma.PrescriptionItemUncheckedUpdateInput = {};
      this.setIfDefined(data, 'dosage', dto.dosage);
      this.setIfDefined(data, 'quantity', dto.quantity);
      this.setIfDefined(data, 'instructions', dto.instructions);

      if (dto.medicineId !== undefined) {
        const med = await this.prisma.medicine.findUnique({ where: { id: dto.medicineId } });
        if (!med) throw new NotFoundException(`Medicine ${dto.medicineId} not found`);
        data.medicineId = dto.medicineId;
        // if price not explicitly provided, refresh price from the new medicine
        if (dto.price === undefined) data.price = med.price;
      }
      if (dto.price !== undefined) data.price = dto.price;

      return await this.repo.updateItem(itemId, data);
    } catch (err) {
      this.handlePrisma(err, `updating item ${itemId} on Prescription ${prescriptionId}`);
    }
  }

  async removeItem(prescriptionId: number, itemId: number): Promise<void> {
    try {
      const item = await this.repo.findItemById(itemId);
      if (!item) throw new NotFoundException(`PrescriptionItem ${itemId} not found`);
      if (item.prescriptionId !== prescriptionId) {
        throw new ForbiddenException('Item does not belong to this Prescription');
      }
      await this.repo.deleteItem(itemId);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('Cannot delete item because dependent payment items exist.');
      }
      this.handlePrisma(err, `deleting item ${itemId} on Prescription ${prescriptionId}`);
    }
  }
}