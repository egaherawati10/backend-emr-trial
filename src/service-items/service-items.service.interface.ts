import { ServiceItem } from '@prisma/client';
import { QueryServiceItemDto } from './dto/query-service-item.dto';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';

export interface IServiceItemsService {
  list(query: QueryServiceItemDto): Promise<{ data: ServiceItem[]; total: number; page: number; pageSize: number }>;
  getById(id: number): Promise<ServiceItem>;
  create(dto: CreateServiceItemDto): Promise<ServiceItem>;
  update(id: number, dto: UpdateServiceItemDto): Promise<ServiceItem>;
  remove(id: number): Promise<void>;
}