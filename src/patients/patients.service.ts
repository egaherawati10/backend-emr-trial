import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Gender } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IPatientsRepository } from './patients.repository.interface';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: IPatientsRepository,
  ) {}

  private toResponse(x: any): PatientResponseDto {
    return x as PatientResponseDto;
  }

  private async assertUserIsPatient(userId: number) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!u) throw new BadRequestException('userId does not exist');
    if (u.role !== 'patient') throw new BadRequestException('userId must be a patient user');
  }

  private async assertClerkIfProvided(clerkId?: number | null) {
    if (clerkId == null) return;
    const c = await this.prisma.user.findUnique({
      where: { id: clerkId },
      select: { id: true, role: true },
    });
    if (!c) throw new BadRequestException('clerkId does not exist');
    if (c.role !== 'registration_clerk') {
      throw new BadRequestException('clerkId must be a registration_clerk');
    }
  }

  async create(dto: CreatePatientDto): Promise<PatientResponseDto> {
    await this.assertUserIsPatient(dto.userId);
    await this.assertClerkIfProvided(dto.clerkId);

    try {
      const created = await this.repo.create({
        user: { connect: { id: dto.userId } },
        dob: new Date(dto.dob),
        gender: dto.gender,
        address: dto.address,
        phone: dto.phone,
        ...(dto.clerkId ? { clerk: { connect: { id: dto.clerkId } } } : {}),
      });
      return this.toResponse(created);
    } catch (e: any) {
      // unique violation on userId (1:1)
      if (e?.code === 'P2002') {
        throw new ConflictException('Patient profile already exists for this user');
      }
      // FK violations (e.g., clerk)
      if (e?.code === 'P2003') {
        throw new BadRequestException('Invalid foreign key');
      }
      throw e;
    }
  }

  async findById(id: number): Promise<PatientResponseDto> {
    const p = await this.repo.findById(id);
    if (!p) throw new NotFoundException('Patient not found');
    return this.toResponse(p);
  }

  async findMany(q: QueryPatientDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const { data, total } = await this.repo.findMany({
      search: q.search,
      gender: q.gender,
      clerkId: q.clerkId,
      page,
      limit,
      sortBy: q.sortBy ?? 'createdAt',
      order: q.order ?? 'desc',
    });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { data: data.map(this.toResponse), meta: { page, limit, total, totalPages } };
  }

  async update(id: number, dto: UpdatePatientDto): Promise<PatientResponseDto> {
    await this.assertClerkIfProvided(dto.clerkId as any);
    const data: Prisma.PatientProfileUpdateInput = {
      ...(dto.dob ? { dob: new Date(dto.dob) } : {}),
      ...(dto.gender ? { gender: dto.gender } : {}),
      ...(dto.address ? { address: dto.address } : {}),
      ...(dto.phone ? { phone: dto.phone } : {}),
      ...(dto.clerkId === null
        ? { clerk: { disconnect: true } }
        : dto.clerkId
        ? { clerk: { connect: { id: dto.clerkId } } }
        : {}),
    };
    const updated = await this.repo.update(id, data);
    return this.toResponse(updated);
  }

  async delete(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}