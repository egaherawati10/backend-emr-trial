import { MedicalRecord, Record as SoapRecord, UserRole } from '@prisma/client';
import { QueryMedicalRecordDto } from './dto/query-medical-record.dto';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

export type IncludeParam = string | string[] | boolean;

export interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IMedicalRecordService {
  // MedicalRecord CRUD
  list(query: QueryMedicalRecordDto): Promise<ListResult<MedicalRecord>>;

  getById(id: number, include?: IncludeParam): Promise<MedicalRecord>;

  create(dto: CreateMedicalRecordDto, include?: IncludeParam): Promise<MedicalRecord>;

  update(id: number, dto: UpdateMedicalRecordDto, include?: IncludeParam): Promise<MedicalRecord>;

  remove(id: number): Promise<void>;

  // SOAP Record (doctor-only by policy; admin bypass via actorRole)
  addRecordByDoctor(
    medicalRecordId: number,
    actorUserId: number,
    dto: CreateRecordDto,
    actorRole?: UserRole,
  ): Promise<SoapRecord>;

  updateRecordByDoctor(
    medicalRecordId: number,
    recordId: number,
    actorUserId: number,
    dto: UpdateRecordDto,
    actorRole?: UserRole,
  ): Promise<SoapRecord>;

  removeRecordByDoctor(
    medicalRecordId: number,
    recordId: number,
    actorUserId: number,
    actorRole?: UserRole,
  ): Promise<void>;
}