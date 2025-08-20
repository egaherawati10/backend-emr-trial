import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServiceItem } from '@prisma/client';
import { IServiceItemsRepository, ServiceItemCreate, ServiceItemOrder, ServiceItemUpdate, ServiceItemWhere } from './service-items.repository.interface';

@Injectable()
export class ServiceItemsRepository implements IServiceItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: { skip?: number; take?: number; where?: ServiceItemWhere; orderBy?: ServiceItemOrder }): Promise<ServiceItem[]> {
    return this.prisma.serviceItem.findMany(params);
  }

  count(where?: ServiceItemWhere): Promise<number> {
    return this.prisma.serviceItem.count({ where });
  }

  findById(id: number): Promise<ServiceItem | null> {
    return this.prisma.serviceItem.findUnique({ where: { id } });
  }

  create(data: ServiceItemCreate): Promise<ServiceItem> {
    return this.prisma.serviceItem.create({ data });
  }

  update(id: number, data: ServiceItemUpdate): Promise<ServiceItem> {
    return this.prisma.serviceItem.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.serviceItem.delete({ where: { id } });
  }
}