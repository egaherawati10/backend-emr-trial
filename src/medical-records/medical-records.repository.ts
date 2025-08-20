import { Injectable } from '@nestjs/common';
import { Prisma, MedicalRecord, Record as SoapRecord } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IMedicalRecordRepository, MedicalRecordCreate, MedicalRecordInclude, MedicalRecordOrder, MedicalRecordUpdate, MedicalRecordWhere } from './medical-records.repository.interface';


@Injectable()
export class MedicalRecordRepository implements IMedicalRecordRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: MedicalRecordWhere;
    orderBy?: MedicalRecordOrder;
    include?: MedicalRecordInclude;
  }): Promise<MedicalRecord[]> {
    const { skip, take, where, orderBy, include } = params;
    return this.prisma.medicalRecord.findMany({
      skip, take, where, orderBy, include,
    });
  }

  async count(where?: MedicalRecordWhere): Promise<number> {
    return this.prisma.medicalRecord.count({ where });
  }

  async findById(id: number, include?: MedicalRecordInclude): Promise<MedicalRecord | null> {
    return this.prisma.medicalRecord.findUnique({
      where: { id },
      include,
    });
  }

  async create(data: MedicalRecordCreate, include?: MedicalRecordInclude): Promise<MedicalRecord> {
    return this.prisma.medicalRecord.create({ data, include });
  }

  async update(id: number, data: MedicalRecordUpdate, include?: MedicalRecordInclude): Promise<MedicalRecord> {
    return this.prisma.medicalRecord.update({ where: { id }, data, include });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.medicalRecord.delete({ where: { id } });
  }

  async findRecordById(recordId: number): Promise<SoapRecord | null> {
    return this.prisma.record.findUnique({ where: { id: recordId } });
  }

  async createRecord(data: Prisma.RecordUncheckedCreateInput): Promise<SoapRecord> {
    return this.prisma.record.create({ data });
  }

  async updateRecord(
    recordId: number,
    data: Prisma.RecordUncheckedUpdateInput,
  ): Promise<SoapRecord> {
    return this.prisma.record.update({ where: { id: recordId }, data });
  }

  async deleteRecord(recordId: number): Promise<void> {
    await this.prisma.record.delete({ where: { id: recordId } });
  }
}

/**
 * Helper to build safe Prisma include from high-level flags/strings.
 * Nested includes:
 *  - prescriptions -> items
 *  - services -> serviceItems -> serviceItem
 *  - payments -> items
 */
export function buildIncludeFromInput(input?: string | string[] | boolean): Prisma.MedicalRecordInclude | undefined {
  if (!input) return undefined;
  let keys: string[];
  if (input === true || input === 'true') {
    keys = ['patient','doctor','clerk','records','prescriptions','services','payments'];
  } else if (Array.isArray(input)) {
    keys = input;
  } else {
    keys = input.split(',').map(s => s.trim()).filter(Boolean);
  }

  const include: Prisma.MedicalRecordInclude = {};
  for (const k of keys) {
    switch (k) {
      case 'patient':
        include.patient = true;
        break;
      case 'doctor':
        include.doctor = true;
        break;
      case 'clerk':
        include.clerk = true;
        break;
      case 'records':
        include.records = true;
        break;
      case 'prescriptions':
        include.prescriptions = { include: { items: true } };
        break;
      case 'services':
        include.services = {
          include: {
            serviceItems: { include: { serviceItem: true } },
          },
        };
        break;
      case 'payments':
        include.payments = { include: { items: true } };
        break;
      default:
        // ignore unknowns
        break;
    }
  }
  return Object.keys(include).length ? include : undefined;
}