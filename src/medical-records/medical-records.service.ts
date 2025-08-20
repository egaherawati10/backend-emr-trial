import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { MedicalRecord, Prisma, Record as SoapRecord, UserRole } from '@prisma/client';
import { QueryMedicalRecordDto } from './dto/query-medical-record.dto';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { IMedicalRecordService } from './medical-records.service.interface';
import { buildIncludeFromInput, MedicalRecordRepository } from './medical-records.repository';
import { UpdateRecordDto } from './dto/update-record.dto';
import { CreateRecordDto } from './dto/create-record.dto';

@Injectable()
export class MedicalRecordService implements IMedicalRecordService {
  constructor(private readonly repo: MedicalRecordRepository) {}

  // ---------------- helpers ----------------

  private toDateOrThrow(iso: string, fieldName: string): Date {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException(`${fieldName} must be a valid ISO-8601 date string`);
    }
    return d;
  }

  /** set field only when value is not undefined (allows empty strings/nulls if you ever add them) */
  private setIfDefined<T extends object, K extends keyof any>(obj: T, key: K, value: unknown) {
    if (value !== undefined) (obj as any)[key] = value;
  }

  private handlePrismaError(err: unknown, context: string): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const target = Array.isArray((err as any).meta?.target)
        ? (err as any).meta?.target.join(', ')
        : String((err as any).meta?.target ?? '');
      switch (err.code) {
        case 'P2002':
          throw new ConflictException(`Unique constraint failed${target ? ` on: ${target}` : ''}`);
        case 'P2003':
          throw new BadRequestException(
            `Invalid reference; this action would violate a foreign key constraint${
              (err as any).meta?.field_name ? ` (${(err as any).meta.field_name})` : ''
            }.`,
          );
        case 'P2025':
          throw new NotFoundException((err as any).meta?.cause ?? 'Record not found');
        case 'P2000':
          throw new BadRequestException('One of the provided values is too long for its column.');
        case 'P2011':
          throw new BadRequestException(`Null constraint violation${target ? ` on: ${target}` : ''}`);
        case 'P2014':
          throw new BadRequestException('Relation constraint violation.');
        default:
          throw new BadRequestException(`Database error (${err.code}) while ${context}.`);
      }
    }
    if (err instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException('Invalid data shape for this operation.');
    }
    throw new InternalServerErrorException(`Unexpected error while ${context}.`);
  }

  // ---------------- service methods ----------------

  async list(query: QueryMedicalRecordDto): Promise<{
    data: MedicalRecord[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 20;
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const where: Prisma.MedicalRecordWhereInput = {
        ...(query.patientId ? { patientId: query.patientId } : {}),
        ...(query.doctorId ? { doctorId: query.doctorId } : {}),
        ...(query.clerkId ? { clerkId: query.clerkId } : {}),
        ...(query.visitFrom || query.visitTo
          ? {
              visitDate: {
                ...(query.visitFrom ? { gte: this.toDateOrThrow(query.visitFrom, 'visitFrom') } : {}),
                ...(query.visitTo ? { lte: this.toDateOrThrow(query.visitTo, 'visitTo') } : {}),
              },
            }
          : {}),
      };

      const orderBy: Prisma.MedicalRecordOrderByWithRelationInput = {
        [query.sortBy ?? 'visitDate']: query.sortOrder ?? 'desc',
      };

      const include = buildIncludeFromInput(query.includeAll ? true : query.include);

      const [data, total] = await Promise.all([
        this.repo.findMany({ skip, take, where, orderBy, include }),
        this.repo.count(where),
      ]);

      return { data, total, page, pageSize };
    } catch (err) {
      this.handlePrismaError(err, 'listing medical records');
    }
  }

  async getById(id: number, include?: string | string[] | boolean): Promise<MedicalRecord> {
    try {
      const record = await this.repo.findById(id, buildIncludeFromInput(include));
      if (!record) throw new NotFoundException(`MedicalRecord ${id} not found`);
      return record;
    } catch (err) {
      this.handlePrismaError(err, `getting MedicalRecord ${id}`);
    }
  }

  async create(dto: CreateMedicalRecordDto, include?: string | string[] | boolean): Promise<MedicalRecord> {
    try {
      const data: Prisma.MedicalRecordUncheckedCreateInput = {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        clerkId: dto.clerkId,
        visitDate: this.toDateOrThrow(dto.visitDate, 'visitDate'),
        diagnosis: dto.diagnosis,
        notes: dto.notes,
      };
      return await this.repo.create(data, buildIncludeFromInput(include));
    } catch (err) {
      this.handlePrismaError(err, 'creating a medical record');
    }
  }

  async update(
    id: number,
    dto: UpdateMedicalRecordDto,
    include?: string | string[] | boolean,
  ): Promise<MedicalRecord> {
    try {
      await this.getById(id); // 404 if not found

      const data: Prisma.MedicalRecordUncheckedUpdateInput = {};
      this.setIfDefined(data, 'patientId', dto.patientId);
      this.setIfDefined(data, 'doctorId', dto.doctorId);
      this.setIfDefined(data, 'clerkId', dto.clerkId);
      this.setIfDefined(data, 'diagnosis', dto.diagnosis);
      this.setIfDefined(data, 'notes', dto.notes);
      if (dto.visitDate !== undefined) {
        this.setIfDefined(data, 'visitDate', this.toDateOrThrow(dto.visitDate, 'visitDate'));
      }

      return await this.repo.update(id, data, buildIncludeFromInput(include));
    } catch (err) {
      this.handlePrismaError(err, `updating MedicalRecord ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.getById(id); // 404 if not found
      await this.repo.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException(
          'Cannot delete MedicalRecord because dependent data exists (SOAP records, prescriptions, services, or payments).',
        );
      }
      this.handlePrismaError(err, `deleting MedicalRecord ${id}`);
    }
  }

  // ---------- SOAP RECORDS (doctor or admin) ----------

  async addRecordByDoctor(
    medicalRecordId: number,
    actorUserId: number,
    dto: CreateRecordDto,
    actorRole?: UserRole, // ← allow admin bypass
  ): Promise<SoapRecord> {
    try {
      const mr = await this.getById(medicalRecordId); // 404 if not found

      // if not admin, only the assigned doctor can add
      if (actorRole !== UserRole.admin && mr.doctorId !== actorUserId) {
        throw new ForbiddenException('Only the assigned doctor can add records to this MedicalRecord');
      }

      // if admin, store under the assigned doctor (not the admin account)
      const effectiveDoctorId = actorRole === UserRole.admin ? mr.doctorId : actorUserId;

      const data: Prisma.RecordUncheckedCreateInput = {
        medicalRecordId,
        patientId: mr.patientId,
        doctorId: effectiveDoctorId,
        subjective: dto.subjective,
        objective: dto.objective,
        assessment: dto.assessment,
        planning: dto.planning,
      };
      return await this.repo.createRecord(data);
    } catch (err) {
      this.handlePrismaError(err, `adding SOAP record to MedicalRecord ${medicalRecordId}`);
    }
  }

  async updateRecordByDoctor(
    medicalRecordId: number,
    recordId: number,
    actorUserId: number,
    dto: UpdateRecordDto,
    actorRole?: UserRole, // ← allow admin bypass
  ): Promise<SoapRecord> {
    try {
      const mr = await this.getById(medicalRecordId); // 404 if not found

      const rec = await this.repo.findRecordById(recordId);
      if (!rec) throw new NotFoundException(`Record ${recordId} not found`);
      if (rec.medicalRecordId !== medicalRecordId) {
        throw new ForbiddenException('Record does not belong to this MedicalRecord');
      }

      if (actorRole !== UserRole.admin) {
        if (mr.doctorId !== actorUserId || rec.doctorId !== actorUserId) {
          throw new ForbiddenException('Only the assigned doctor can update this Record');
        }
      }

      const data: Prisma.RecordUncheckedUpdateInput = {};
      this.setIfDefined(data, 'subjective', dto.subjective);
      this.setIfDefined(data, 'objective', dto.objective);
      this.setIfDefined(data, 'assessment', dto.assessment);
      this.setIfDefined(data, 'planning', dto.planning);

      return await this.repo.updateRecord(recordId, data);
    } catch (err) {
      this.handlePrismaError(err, `updating Record ${recordId} on MedicalRecord ${medicalRecordId}`);
    }
  }

  async removeRecordByDoctor(
    medicalRecordId: number,
    recordId: number,
    actorUserId: number,
    actorRole?: UserRole, // ← allow admin bypass
  ): Promise<void> {
    try {
      const mr = await this.getById(medicalRecordId); // 404 if not found

      const rec = await this.repo.findRecordById(recordId);
      if (!rec) throw new NotFoundException(`Record ${recordId} not found`);
      if (rec.medicalRecordId !== medicalRecordId) {
        throw new ForbiddenException('Record does not belong to this MedicalRecord');
      }

      if (actorRole !== UserRole.admin) {
        if (mr.doctorId !== actorUserId || rec.doctorId !== actorUserId) {
          throw new ForbiddenException('Only the assigned doctor can delete this Record');
        }
      }

      await this.repo.deleteRecord(recordId);
    } catch (err) {
      this.handlePrismaError(err, `deleting Record ${recordId} on MedicalRecord ${medicalRecordId}`);
    }
  }
}