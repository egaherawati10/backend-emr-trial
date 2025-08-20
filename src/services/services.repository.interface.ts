import { Prisma, Service, ServiceOnServiceItem } from '@prisma/client';

export type ServiceWhere = Prisma.ServiceWhereInput;
export type ServiceOrder = Prisma.ServiceOrderByWithRelationInput;
export type ServiceInclude = Prisma.ServiceInclude;
export type ServiceCreate = Prisma.ServiceUncheckedCreateInput;
export type ServiceUpdate = Prisma.ServiceUncheckedUpdateInput;

export interface IServicesRepository {
  // Service
  findMany(params: { skip?: number; take?: number; where?: ServiceWhere; orderBy?: ServiceOrder; include?: ServiceInclude }): Promise<Service[]>;
  count(where?: ServiceWhere): Promise<number>;
  findById(id: number, include?: ServiceInclude): Promise<Service | null>;
  create(data: ServiceCreate, include?: ServiceInclude): Promise<Service>;
  update(id: number, data: ServiceUpdate, include?: ServiceInclude): Promise<Service>;
  delete(id: number): Promise<void>;

  // Lines (ServiceOnServiceItem)
  findLineById(id: number): Promise<ServiceOnServiceItem | null>;
  findLineByServiceAndItem(serviceId: number, serviceItemId: number): Promise<ServiceOnServiceItem | null>; // ← NEW
  createLine(data: Prisma.ServiceOnServiceItemUncheckedCreateInput): Promise<ServiceOnServiceItem>;
  updateLine(id: number, data: Prisma.ServiceOnServiceItemUncheckedUpdateInput): Promise<ServiceOnServiceItem>;
  deleteLine(id: number): Promise<void>;
}