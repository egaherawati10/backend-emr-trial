import { Gender, Prisma } from '@prisma/client';

export interface IPatientsRepository {
  create(data: Prisma.PatientProfileCreateInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  findMany(params: {
    search?: string;
    gender?: Gender;
    clerkId?: number;
    page: number;
    limit: number;
    sortBy: 'createdAt' | 'updatedAt' | 'dob' | 'name';
    order: 'asc' | 'desc';
  }): Promise<{ data: any[]; total: number }>;
  update(id: number, data: Prisma.PatientProfileUpdateInput): Promise<any>;
  softDelete(id: number): Promise<void>;
}