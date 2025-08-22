import { CreateMedicalRecordForPatientDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { QueryMedicalRecordDto } from './dto/query-medical-record.dto';
import {
  MedicalRecordResponseDto,
  PaginatedMedicalRecordResponseDto,
} from './dto/medical-record-response.dto';

export type UserCtx = { id: number; role: string };

export interface IMedicalRecordsService {
  // patient-scoped collection
  listForPatient(
    patientId: number,
    q: QueryMedicalRecordDto,
    currentUser: UserCtx,
  ): Promise<PaginatedMedicalRecordResponseDto>;

  getOneForPatient(
    patientId: number,
    medicalRecordId: number,
    currentUser: UserCtx,
  ): Promise<MedicalRecordResponseDto>;

  createForPatient(
    patientId: number,
    dto: CreateMedicalRecordForPatientDto,
    actorId: number,
  ): Promise<MedicalRecordResponseDto>;

  // canonical item endpoints
  findById(id: number, currentUser: UserCtx): Promise<MedicalRecordResponseDto>;

  update(
    id: number,
    dto: UpdateMedicalRecordDto,
    actorId: number,
  ): Promise<MedicalRecordResponseDto>;

  delete(id: number): Promise<void>;
}

/** Nest injection token so we can inject by interface */
export const MEDICAL_RECORDS_SERVICE = Symbol('MEDICAL_RECORDS_SERVICE');