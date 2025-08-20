import { Prisma } from '@prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

export type PatientWithRefs = Prisma.PatientProfileGetPayload<{
  include: {
    user: {
      select: { id: true; name: true; email: true; username: true; role: true };
    };
    clerk: {
      select: { id: true; name: true; email: true; username: true; role: true };
    };
  };
}>;

export interface IPatientsRepository {
  findAll(): Promise<PatientWithRefs[]>;
  findOne(id: number): Promise<PatientWithRefs | null>;
  findByUserId(userId: number): Promise<PatientWithRefs | null>;
  create(data: CreatePatientDto): Promise<PatientWithRefs>;
  update(id: number, data: UpdatePatientDto): Promise<PatientWithRefs>;
  delete(id: number): Promise<PatientWithRefs>;
}