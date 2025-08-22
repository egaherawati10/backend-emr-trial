import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MedicalRecordsRepository } from './medical-records.repository';
import { CreateMedicalRecordForPatientDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { QueryMedicalRecordDto } from './dto/query-medical-record.dto';
import { MedicalRecordResponseDto } from './dto/medical-record-response.dto';
import { IMedicalRecordsService } from './medical-records.service.interface';

@Injectable()
export class MedicalRecordsService implements IMedicalRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: MedicalRecordsRepository,
  ) {}

  private toDto(x: any): MedicalRecordResponseDto { return x as MedicalRecordResponseDto; }

  private async assertUserRole(userId: number, role: UserRole) {
    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!u || u.role !== role) throw new BadRequestException(`userId must reference a ${role}`);
  }

  private async getPatientProfile(patientId: number) {
    const p = await this.prisma.patientProfile.findFirst({
      where: { id: patientId, deletedAt: null },
      select: { id: true },
    });
    if (!p) throw new NotFoundException('Patient not found');
    return p;
  }

  private async assertPatientScopeForPatientUser(currentUser: { id: number; role: string }, patientId: number) {
    if (currentUser.role !== 'patient') return;
    const me = await this.prisma.patientProfile.findFirst({
      where: { userId: currentUser.id, deletedAt: null },
      select: { id: true },
    });
    if (!me || me.id !== patientId) throw new NotFoundException('Medical record not found');
  }

  // ---------- Patient-scoped collection ----------
  async listForPatient(patientId: number, q: QueryMedicalRecordDto, currentUser: { id: number; role: string }) {
    await this.getPatientProfile(patientId);
    await this.assertPatientScopeForPatientUser(currentUser, patientId);

    const where: Prisma.MedicalRecordWhereInput = {
      patientId,
      ...(q.search
        ? {
            OR: [
              { diagnosis: { contains: q.search, mode: 'insensitive' } },
              { notes: { contains: q.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(q.dateFrom || q.dateTo
        ? {
            visitDate: {
              ...(q.dateFrom ? { gte: new Date(q.dateFrom) } : {}),
              ...(q.dateTo ? { lte: new Date(q.dateTo) } : {}),
            },
          }
        : {}),
    };

    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const { data, total } = await this.repo.findMany({
      where,
      page,
      limit,
      sortBy: q.sortBy ?? 'visitDate',
      order: q.order ?? 'desc',
    });
    return { data: data.map(this.toDto), meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
  }

  async getOneForPatient(patientId: number, medicalRecordId: number, currentUser: { id: number; role: string }) {
    await this.getPatientProfile(patientId);
    await this.assertPatientScopeForPatientUser(currentUser, patientId);

    const mr = await this.repo.findById(medicalRecordId);
    if (!mr || mr.patientId !== patientId) throw new NotFoundException('Medical record not found');
    return this.toDto(mr);
  }

  async createForPatient(patientId: number, dto: CreateMedicalRecordForPatientDto, actorId: number) {
    await this.getPatientProfile(patientId);
    await this.assertUserRole(dto.doctorId, 'doctor');
    await this.assertUserRole(dto.clerkId, 'registration_clerk');

    const created = await this.repo.create({
      patient: { connect: { id: patientId } },
      doctor: { connect: { id: dto.doctorId } },
      clerk:  { connect: { id: dto.clerkId } },
      visitDate: new Date(dto.visitDate),
      diagnosis: dto.diagnosis,
      notes: dto.notes ?? null,
      createdBy: { connect: { id: actorId } },
      updatedBy: { connect: { id: actorId } },
    });
    return this.toDto(created);
  }

  // ---------- Canonical items ----------
  async findById(id: number, currentUser: { id: number; role: string }) {
    const mr = await this.repo.findById(id);
    if (!mr) throw new NotFoundException('Medical record not found');

    // patient users can only see their own
    await this.assertPatientScopeForPatientUser(currentUser, mr.patientId);
    return this.toDto(mr);
  }

  async update(id: number, dto: UpdateMedicalRecordDto, actorId: number) {
    if (dto.doctorId) await this.assertUserRole(dto.doctorId, 'doctor');
    if (dto.clerkId) await this.assertUserRole(dto.clerkId, 'registration_clerk');

    const data: Prisma.MedicalRecordUpdateInput = {
      ...(dto.doctorId ? { doctor: { connect: { id: dto.doctorId } } } : {}),
      ...(dto.clerkId  ? { clerk:  { connect: { id: dto.clerkId } } } : {}),
      ...(dto.visitDate ? { visitDate: new Date(dto.visitDate) } : {}),
      ...(dto.diagnosis ? { diagnosis: dto.diagnosis } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      updatedBy: { connect: { id: actorId } },
    };
    const updated = await this.repo.update(id, data);
    return this.toDto(updated);
  }

  async delete(id: number) {
    await this.repo.softDelete(id);
  }
}