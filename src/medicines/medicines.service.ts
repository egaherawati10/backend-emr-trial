import {
  BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import { Medicine, Prisma } from '@prisma/client';
import { MedicinesRepository } from './medicines.repository';
import { QueryMedicineDto } from './dto/query-medicine.dto';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { IMedicinesService } from './medicines.service.interface';

@Injectable()
export class MedicinesService implements IMedicinesService {
  constructor(private readonly repo: MedicinesRepository) {}

  private handlePrismaError(err: unknown, ctx: string): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const target = Array.isArray((err as any).meta?.target) ? (err as any).meta?.target.join(', ') : String((err as any).meta?.target ?? '');
      switch (err.code) {
        case 'P2002': throw new ConflictException(`Unique constraint failed${target ? ` on: ${target}` : ''}`);
        case 'P2003': throw new BadRequestException('Invalid reference; foreign key constraint would be violated.');
        case 'P2025': throw new NotFoundException((err as any).meta?.cause ?? 'Record not found');
        default: throw new BadRequestException(`Database error (${err.code}) while ${ctx}.`);
      }
    }
    if (err instanceof Prisma.PrismaClientValidationError) throw new BadRequestException('Invalid data shape.');
    throw new InternalServerErrorException(`Unexpected error while ${ctx}.`);
  }

  async list(query: QueryMedicineDto): Promise<{ data: Medicine[]; total: number; page: number; pageSize: number }> {
    try {
      const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
      const where: Prisma.MedicineWhereInput = query.search ? {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { type: { contains: query.search, mode: 'insensitive' } },
          { manufacturer: { contains: query.search, mode: 'insensitive' } },
        ],
      } : {};
      const [data, total] = await Promise.all([
        this.repo.findMany({ skip: (page - 1) * pageSize, take: pageSize, where, orderBy: { updatedAt: 'desc' } }),
        this.repo.count(where),
      ]);
      return { data, total, page, pageSize };
    } catch (err) { this.handlePrismaError(err, 'listing medicines'); }
  }

  async getById(id: number): Promise<Medicine> {
    try {
      const row = await this.repo.findById(id);
      if (!row) throw new NotFoundException(`Medicine ${id} not found`);
      return row;
    } catch (err) { this.handlePrismaError(err, `getting Medicine ${id}`); }
  }

  async create(dto: CreateMedicineDto): Promise<Medicine> {
    try {
      return await this.repo.create({ ...dto });
    } catch (err) { this.handlePrismaError(err, 'creating a medicine'); }
  }

  async update(id: number, dto: UpdateMedicineDto): Promise<Medicine> {
    try {
      await this.getById(id);
      const data: Prisma.MedicineUncheckedUpdateInput = {};
      if (dto.name !== undefined) data.name = dto.name;
      if (dto.dosage !== undefined) data.dosage = dto.dosage;
      if (dto.type !== undefined) data.type = dto.type;
      if (dto.manufacturer !== undefined) data.manufacturer = dto.manufacturer;
      if (dto.stock !== undefined) data.stock = dto.stock;
      if (dto.price !== undefined) data.price = dto.price;
      return await this.repo.update(id, data);
    } catch (err) { this.handlePrismaError(err, `updating Medicine ${id}`); }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.repo.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        // linked prescription items, payments, etc.
        throw new ConflictException('Cannot delete Medicine because dependent records exist (prescription items).');
      }
      this.handlePrismaError(err, `deleting Medicine ${id}`);
    }
  }
}