import { Prisma } from '@prisma/client';

export interface IMedicalRecordsRepository {
  create(data: Prisma.MedicalRecordCreateInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  findMany(args: {
    where: Prisma.MedicalRecordWhereInput;
    page: number; limit: number;
    sortBy: 'visitDate' | 'createdAt' | 'updatedAt';
    order: 'asc' | 'desc';
  }): Promise<{ data: any[]; total: number }>;
  update(id: number, data: Prisma.MedicalRecordUpdateInput): Promise<any>;
  softDelete(id: number): Promise<void>;
}