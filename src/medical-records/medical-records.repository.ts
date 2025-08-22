import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IMedicalRecordsRepository } from './medical-records.repository.interface';

const userMin = { id: true, name: true, username: true, email: true };

const select = {
  id: true,
  patientId: true,
  doctorId: true,
  clerkId: true,
  visitDate: true,
  diagnosis: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  doctor: { select: userMin },
  clerk: { select: userMin },
};

@Injectable()
export class MedicalRecordsRepository implements IMedicalRecordsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MedicalRecordCreateInput) {
    return this.prisma.medicalRecord.create({ data, select });
  }

  findById(id: number) {
    return this.prisma.medicalRecord.findFirst({
      where: { id, deletedAt: null },
      select,
    });
  }

  async findMany(args: {
    where: Prisma.MedicalRecordWhereInput; page: number; limit: number;
    sortBy: 'visitDate' | 'createdAt' | 'updatedAt'; order: 'asc' | 'desc';
  }) {
    const { where, page, limit, sortBy, order } = args;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.medicalRecord.findMany({
        where: { ...where, deletedAt: null },
        select,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.medicalRecord.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async update(id: number, data: Prisma.MedicalRecordUpdateInput) {
    try {
      return await this.prisma.medicalRecord.update({ where: { id }, data, select });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Medical record not found');
      throw e;
    }
  }

  async softDelete(id: number) {
    try {
      await this.prisma.medicalRecord.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Medical record not found');
      throw e;
    }
  }
}