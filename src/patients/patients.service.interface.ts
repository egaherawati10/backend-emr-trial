import { UserRole } from '@prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientWithRefs } from './patients.repository.interface';

export interface IPatientsService {
  findAll(): Promise<PatientWithRefs[]>;
  findOne(id: number, requesterId: number, requesterRole: UserRole): Promise<PatientWithRefs>;
  create(data: CreatePatientDto, requesterId: number, requesterRole: UserRole): Promise<PatientWithRefs>;
  update(
    id: number,
    data: UpdatePatientDto,
    requesterId: number,
    requesterRole: UserRole
  ): Promise<PatientWithRefs>;
  remove(id: number, requesterId: number, requesterRole: UserRole): Promise<void>;
}