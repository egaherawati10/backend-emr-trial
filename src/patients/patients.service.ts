import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.patientProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, username: true, role: true } },
        clerk: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findOne(id: number) {
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, username: true, role: true } },
        clerk: { select: { id: true, name: true, email: true } },
      },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async create(data: CreatePatientDto) {
    return this.prisma.patientProfile.create({
      data,
      include: {
        user: { select: { id: true, name: true, email: true, username: true, role: true } },
        clerk: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: number, data: UpdatePatientDto) {
    await this.findOne(id); // ensure exists
    return this.prisma.patientProfile.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, username: true, role: true } },
        clerk: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.patientProfile.delete({ where: { id } });
  }
}