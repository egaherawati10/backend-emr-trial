import { Injectable } from '@nestjs/common';
import { Medicine, Prisma } from '@prisma/client';
import { IMedicinesRepository, MedicineCreate, MedicineOrder, MedicineUpdate, MedicineWhere } from './medicines.repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MedicinesRepository implements IMedicinesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: { skip?: number; take?: number; where?: MedicineWhere; orderBy?: MedicineOrder }): Promise<Medicine[]> {
    return this.prisma.medicine.findMany(params);
  }

  count(where?: MedicineWhere): Promise<number> {
    return this.prisma.medicine.count({ where });
  }

  findById(id: number): Promise<Medicine | null> {
    return this.prisma.medicine.findUnique({ where: { id } });
  }

  create(data: MedicineCreate): Promise<Medicine> {
    return this.prisma.medicine.create({ data });
  }

  update(id: number, data: MedicineUpdate): Promise<Medicine> {
    return this.prisma.medicine.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.medicine.delete({ where: { id } });
  }
}