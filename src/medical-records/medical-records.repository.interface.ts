import { MedicalRecord, Prisma } from '@prisma/client';

export type MedicalRecordInclude = Prisma.MedicalRecordInclude;
export type MedicalRecordWhere = Prisma.MedicalRecordWhereInput;
export type MedicalRecordOrder = Prisma.MedicalRecordOrderByWithRelationInput;
export type MedicalRecordCreate = Prisma.MedicalRecordUncheckedCreateInput;
export type MedicalRecordUpdate = Prisma.MedicalRecordUncheckedUpdateInput;

export interface IMedicalRecordRepository {
  findMany(params: {
    skip?: number;
    take?: number;
    where?: MedicalRecordWhere;
    orderBy?: MedicalRecordOrder;
    include?: MedicalRecordInclude;
  }): Promise<MedicalRecord[]>;

  count(where?: MedicalRecordWhere): Promise<number>;

  findById(id: number, include?: MedicalRecordInclude): Promise<MedicalRecord | null>;

  create(data: MedicalRecordCreate, include?: MedicalRecordInclude): Promise<MedicalRecord>;

  update(id: number, data: MedicalRecordUpdate, include?: MedicalRecordInclude): Promise<MedicalRecord>;

  delete(id: number): Promise<void>;
}