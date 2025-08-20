import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { IPatientsService } from './patients.service.interface';
import { PatientsRepository } from './patients.repository';
import { PatientWithRefs } from './patients.repository.interface';

// RBAC allow-lists
const CAN_CREATE_PATIENT = [UserRole.admin, UserRole.registration_clerk] as const;
const CAN_UPDATE_PATIENT = [UserRole.admin, UserRole.registration_clerk] as const;
const CAN_DELETE_PATIENT = [UserRole.admin, UserRole.registration_clerk] as const;

const assertAllowed = (role: UserRole, allow: readonly UserRole[], msg: string) => {
  if (!allow.includes(role)) throw new ForbiddenException(msg);
};

@Injectable()
export class PatientsService implements IPatientsService {
  constructor(private readonly patientsRepo: PatientsRepository) {}

  async findAll(): Promise<PatientWithRefs[]> {
    try {
      return await this.patientsRepo.findAll();
    } catch {
      throw new BadRequestException('Failed to fetch patients');
    }
  }

  async findOne(
    id: number,
    requesterId: number,
    requesterRole: UserRole,
  ): Promise<PatientWithRefs> {
    try {
      const patient = await this.patientsRepo.findOne(id);
      if (!patient) throw new NotFoundException(`Patient with ID ${id} not found`);

      // Patient can only view their own profile
      if (requesterRole === UserRole.patient && patient.user.id !== requesterId) {
        throw new ForbiddenException('You are not allowed to view this patient profile');
      }
      return patient;
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException) throw err;
      throw new BadRequestException('Failed to fetch patient');
    }
  }

  async create(
    data: CreatePatientDto,
    requesterId: number,
    requesterRole: UserRole,
  ): Promise<PatientWithRefs> {
    assertAllowed(requesterRole, CAN_CREATE_PATIENT, 'You are not allowed to create a patient profile');

    try {
      // auto-stamp clerkId
      const { clerkId: _ignore, ...rest } = data;
      return await this.patientsRepo.create({ ...rest, clerkId: requesterId } as CreatePatientDto);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new ConflictException('Patient profile for this user already exists');
        if (error.code === 'P2003') throw new BadRequestException('Invalid userId or clerkId reference');
      }
      throw new BadRequestException('Failed to create patient profile');
    }
  }

  async update(
    id: number,
    data: UpdatePatientDto,
    _requesterId: number,
    requesterRole: UserRole,
  ): Promise<PatientWithRefs> {
    assertAllowed(requesterRole, CAN_UPDATE_PATIENT, 'You are not allowed to update this patient profile');

    try {
      const existing = await this.patientsRepo.findOne(id);
      if (!existing) throw new NotFoundException(`Patient with ID ${id} not found`);
      return await this.patientsRepo.update(id, data);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException('Invalid userId or clerkId reference');
      }
      throw new BadRequestException('Failed to update patient profile');
    }
  }

  async remove(
    id: number,
    _requesterId: number,
    requesterRole: UserRole,
  ): Promise<void> {
    assertAllowed(requesterRole, CAN_DELETE_PATIENT, 'You are not allowed to delete this patient');

    try {
      const existing = await this.patientsRepo.findOne(id);
      if (!existing) throw new NotFoundException(`Patient with ID ${id} not found`);
      await this.patientsRepo.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to delete patient');
    }
  }
}