import { Injectable } from '@nestjs/common';
import { Prisma, PatientProfile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IPatientsRepository, PatientWithRefs } from './patients.repository.interface';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

const patientInclude = {
  user:  { select: { id: true, name: true, email: true, username: true, role: true } },
  clerk: { select: { id: true, name: true, email: true, username: true, role: true } },
} as const satisfies Prisma.PatientProfileInclude;

// Normalize dob from string to Date
const toDate = (d: string | Date): Date => (d instanceof Date ? d : new Date(d));

@Injectable()
export class PatientsRepository implements IPatientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PatientWithRefs[]> {
    return this.prisma.patientProfile.findMany({ include: patientInclude });
  }

  findOne(id: number): Promise<PatientWithRefs | null> {
    return this.prisma.patientProfile.findUnique({
      where: { id },
      include: patientInclude,
    });
  }

  findByUserId(userId: number): Promise<PatientWithRefs | null> {
    return this.prisma.patientProfile.findUnique({
      where: { userId },
      include: patientInclude,
    });
  }

  create(dto: CreatePatientDto): Promise<PatientWithRefs> {
    const data: Prisma.PatientProfileUncheckedCreateInput = {
      userId: dto.userId,
      dob: toDate(dto.dob as any),
      gender: dto.gender,
      address: dto.address,
      phone: dto.phone,
      clerkId: dto.clerkId!, // stamping
    };
    return this.prisma.patientProfile.create({ data, include: patientInclude });
  }

  update(id: number, dto: UpdatePatientDto): Promise<PatientWithRefs> {
    const data: Prisma.PatientProfileUncheckedUpdateInput = {
      ...(dto.userId !== undefined ? { userId: dto.userId } : {}),
      ...(dto.dob !== undefined ? { dob: toDate(dto.dob as any) } : {}),
      ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.clerkId !== undefined ? { clerkId: dto.clerkId } : {}),
    };
    return this.prisma.patientProfile.update({
      where: { id },
      data,
      include: patientInclude,
    });
  }

  delete(id: number): Promise<PatientWithRefs> {
    return this.prisma.patientProfile.delete({
      where: { id },
      include: patientInclude,
    });
  }
}