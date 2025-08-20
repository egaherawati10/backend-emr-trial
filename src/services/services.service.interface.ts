import { Service, ServiceOnServiceItem as ServiceLine, UserRole } from '@prisma/client';
import { QueryServiceDto } from './dto/query-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServiceLineDto } from './items/dto/create-service-line.dto';
import { UpdateServiceLineDto } from './items/dto/update-service-line.dto';

export type IncludeParam = string | string[] | boolean;
export interface Actor { userId: number; role: UserRole; }

export interface IServicesService {
  list(query: QueryServiceDto, actor: Actor): Promise<{ data: Service[]; total: number; page: number; pageSize: number }>;
  getById(id: number, include: IncludeParam | undefined, actor: Actor): Promise<Service>;

  create(dto: CreateServiceDto, include?: IncludeParam): Promise<Service>;
  update(id: number, dto: UpdateServiceDto, include?: IncludeParam): Promise<Service>;
  remove(id: number): Promise<void>;

  addLine(serviceId: number, dto: CreateServiceLineDto): Promise<ServiceLine>;
  updateLine(serviceId: number, lineId: number, dto: UpdateServiceLineDto): Promise<ServiceLine>;
  removeLine(serviceId: number, lineId: number): Promise<void>;
}