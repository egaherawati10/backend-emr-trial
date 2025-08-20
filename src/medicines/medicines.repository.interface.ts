import { Medicine, Prisma } from '@prisma/client';

export type MedicineWhere = Prisma.MedicineWhereInput;
export type MedicineOrder = Prisma.MedicineOrderByWithRelationInput;
export type MedicineCreate = Prisma.MedicineUncheckedCreateInput;
export type MedicineUpdate = Prisma.MedicineUncheckedUpdateInput;

export interface IMedicinesRepository {
  findMany(params: { skip?: number; take?: number; where?: MedicineWhere; orderBy?: MedicineOrder }): Promise<Medicine[]>;
  count(where?: MedicineWhere): Promise<number>;
  findById(id: number): Promise<Medicine | null>;
  create(data: MedicineCreate): Promise<Medicine>;
  update(id: number, data: MedicineUpdate): Promise<Medicine>;
  delete(id: number): Promise<void>;
}