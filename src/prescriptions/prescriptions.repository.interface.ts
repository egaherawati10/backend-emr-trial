import { Prisma, Prescription, PrescriptionItem } from '@prisma/client';

export type PrescriptionWhere = Prisma.PrescriptionWhereInput;
export type PrescriptionOrder = Prisma.PrescriptionOrderByWithRelationInput;
export type PrescriptionInclude = Prisma.PrescriptionInclude;
export type PrescriptionCreate = Prisma.PrescriptionUncheckedCreateInput;
export type PrescriptionUpdate = Prisma.PrescriptionUncheckedUpdateInput;

export interface IPrescriptionsRepository {
  findMany(params: { skip?: number; take?: number; where?: PrescriptionWhere; orderBy?: PrescriptionOrder; include?: PrescriptionInclude }): Promise<Prescription[]>;
  count(where?: PrescriptionWhere): Promise<number>;
  findById(id: number, include?: PrescriptionInclude): Promise<Prescription | null>;
  create(data: PrescriptionCreate, include?: PrescriptionInclude): Promise<Prescription>;
  update(id: number, data: PrescriptionUpdate, include?: PrescriptionInclude): Promise<Prescription>;
  delete(id: number): Promise<void>;

  // Items
  findItemById(itemId: number): Promise<PrescriptionItem | null>;
  createItem(data: Prisma.PrescriptionItemUncheckedCreateInput): Promise<PrescriptionItem>;
  updateItem(id: number, data: Prisma.PrescriptionItemUncheckedUpdateInput): Promise<PrescriptionItem>;
  deleteItem(id: number): Promise<void>;
}