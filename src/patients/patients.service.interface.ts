import { Gender } from '@prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';

export interface IPatientsService {
  create(dto: CreatePatientDto): Promise<PatientResponseDto>;
  findById(id: number): Promise<PatientResponseDto>;
  findMany(q: QueryPatientDto): Promise<{ data: PatientResponseDto[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;
  update(id: number, dto: UpdatePatientDto): Promise<PatientResponseDto>;
  delete(id: number): Promise<void>;
}