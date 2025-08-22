import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Gender } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IPatientsRepository } from './patients.repository.interface';

const select = {
  id: true,
  userId: true,
  dob: true,
  gender: true,
  address: true,
  phone: true,
  clerkId: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, username: true, email: true } },
  clerk: { select: { id: true, name: true, username: true, email: true } },
};

@Injectable()
export class PatientsRepository implements IPatientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PatientProfileCreateInput) {
    return this.prisma.patientProfile.create({ data, select });
  }

  async findById(id: number) {
    return this.prisma.patientProfile.findFirst({
      where: { id, deletedAt: null },
      select,
    });
  }

  async findMany(params: {
    search?: string;
    gender?: Gender;
    clerkId?: number;
    page: number;
    limit: number;
    sortBy: 'createdAt' | 'updatedAt' | 'dob' | 'name';
    order: 'asc' | 'desc';
  }) {
    const { search, gender, clerkId, page, limit, sortBy, order } = params;

    const where: Prisma.PatientProfileWhereInput = {
      deletedAt: null,
      ...(gender ? { gender } : {}),
      ...(clerkId ? { clerkId } : {}),
      ...(search
        ? {
            OR: [
              { phone: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
              { user: {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { username: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const orderBy =
      sortBy === 'name'
        ? ({ user: { name: order } } as Prisma.PatientProfileOrderByWithRelationInput)
        : ({ [sortBy]: order } as Prisma.PatientProfileOrderByWithRelationInput);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.patientProfile.findMany({
        where,
        select,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.patientProfile.count({ where }),
    ]);

    return { data, total };
  }

  async update(id: number, data: Prisma.PatientProfileUpdateInput) {
    try {
      return await this.prisma.patientProfile.update({
        where: { id },
        data,
        select,
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Patient not found');
      throw e;
    }
  }

  async softDelete(id: number) {
    try {
      await this.prisma.patientProfile.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Patient not found');
      throw e;
    }
  }
}