import { Prisma, ServiceItem } from '@prisma/client';

export type ServiceItemWhere = Prisma.ServiceItemWhereInput;
export type ServiceItemOrder = Prisma.ServiceItemOrderByWithRelationInput;
export type ServiceItemCreate = Prisma.ServiceItemUncheckedCreateInput;
export type ServiceItemUpdate = Prisma.ServiceItemUncheckedUpdateInput;

export interface IServiceItemsRepository {
  findMany(params: { skip?: number; take?: number; where?: ServiceItemWhere; orderBy?: ServiceItemOrder }): Promise<ServiceItem[]>;
  count(where?: ServiceItemWhere): Promise<number>;
  findById(id: number): Promise<ServiceItem | null>;
  create(data: ServiceItemCreate): Promise<ServiceItem>;
  update(id: number, data: ServiceItemUpdate): Promise<ServiceItem>;
  delete(id: number): Promise<void>;
}