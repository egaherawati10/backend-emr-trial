import { Injectable } from '@nestjs/common';
import { Prisma, Prescription, PrescriptionItem } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IPrescriptionsRepository, PrescriptionCreate, PrescriptionInclude, PrescriptionOrder, PrescriptionUpdate, PrescriptionWhere } from './prescriptions.repository.interface';

@Injectable()
export class PrescriptionsRepository implements IPrescriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: { skip?: number; take?: number; where?: PrescriptionWhere; orderBy?: PrescriptionOrder; include?: PrescriptionInclude }): Promise<Prescription[]> {
    return this.prisma.prescription.findMany(params);
  }

  count(where?: PrescriptionWhere): Promise<number> {
    return this.prisma.prescription.count({ where });
  }

  findById(id: number, include?: PrescriptionInclude): Promise<Prescription | null> {
    return this.prisma.prescription.findUnique({ where: { id }, include });
  }

  create(data: PrescriptionCreate, include?: PrescriptionInclude): Promise<Prescription> {
    return this.prisma.prescription.create({ data, include });
  }

  update(id: number, data: PrescriptionUpdate, include?: PrescriptionInclude): Promise<Prescription> {
    return this.prisma.prescription.update({ where: { id }, data, include });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.prescription.delete({ where: { id } });
  }

  // Items
  findItemById(itemId: number): Promise<PrescriptionItem | null> {
    return this.prisma.prescriptionItem.findUnique({ where: { id: itemId } });
  }

  createItem(data: Prisma.PrescriptionItemUncheckedCreateInput): Promise<PrescriptionItem> {
    return this.prisma.prescriptionItem.create({ data });
  }

  updateItem(id: number, data: Prisma.PrescriptionItemUncheckedUpdateInput): Promise<PrescriptionItem> {
    return this.prisma.prescriptionItem.update({ where: { id }, data });
  }

  async deleteItem(id: number): Promise<void> {
    await this.prisma.prescriptionItem.delete({ where: { id } });
  }
}

/** Build Prisma include from the high-level include param. */
export function buildPrescriptionInclude(input?: string | string[] | boolean): Prisma.PrescriptionInclude | undefined {
  if (!input) return undefined;
  let keys: string[];
  if (input === true || input === 'true') {
    keys = ['patient','doctor','pharmacist','medicalRecord','items'];
  } else if (Array.isArray(input)) keys = input;
  else keys = input.split(',').map(s => s.trim()).filter(Boolean);

  const include: Prisma.PrescriptionInclude = {};
  for (const k of keys) {
    switch (k) {
      case 'patient': include.patient = true; break;
      case 'doctor': include.doctor = true; break;
      case 'pharmacist': include.pharmacist = true; break;
      case 'medicalRecord': include.medicalRecord = true; break;
      case 'items': include.items = { include: { medicine: true } }; break;
      default: break;
    }
  }
  return Object.keys(include).length ? include : undefined;
}