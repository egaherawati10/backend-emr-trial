import { Injectable } from '@nestjs/common';
import { Prisma, Service, ServiceOnServiceItem } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IServicesRepository, ServiceCreate, ServiceInclude, ServiceOrder, ServiceUpdate, ServiceWhere } from './services.repository.interface';

@Injectable()
export class ServicesRepository implements IServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Service
  findMany(params: { skip?: number; take?: number; where?: ServiceWhere; orderBy?: ServiceOrder; include?: ServiceInclude }): Promise<Service[]> {
    return this.prisma.service.findMany(params);
  }

  count(where?: ServiceWhere): Promise<number> {
    return this.prisma.service.count({ where });
  }

  findById(id: number, include?: ServiceInclude): Promise<Service | null> {
    return this.prisma.service.findUnique({ where: { id }, include });
  }

  create(data: ServiceCreate, include?: ServiceInclude): Promise<Service> {
    return this.prisma.service.create({ data, include });
  }

  update(id: number, data: ServiceUpdate, include?: ServiceInclude): Promise<Service> {
    return this.prisma.service.update({ where: { id }, data, include });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.service.delete({ where: { id } });
  }

  // Lines
  findLineById(id: number): Promise<ServiceOnServiceItem | null> {
    return this.prisma.serviceOnServiceItem.findUnique({ where: { id } });
  }

  findLineByServiceAndItem(serviceId: number, serviceItemId: number): Promise<ServiceOnServiceItem | null> {
    return this.prisma.serviceOnServiceItem.findFirst({ where: { serviceId, serviceItemId } });
  }

  createLine(data: Prisma.ServiceOnServiceItemUncheckedCreateInput): Promise<ServiceOnServiceItem> {
    return this.prisma.serviceOnServiceItem.create({ data });
  }

  updateLine(id: number, data: Prisma.ServiceOnServiceItemUncheckedUpdateInput): Promise<ServiceOnServiceItem> {
    return this.prisma.serviceOnServiceItem.update({ where: { id }, data });
  }

  async deleteLine(id: number): Promise<void> {
    await this.prisma.serviceOnServiceItem.delete({ where: { id } });
  }
}

/** Build Prisma include from a high-level include param. */
export function buildServiceInclude(input?: string | string[] | boolean): Prisma.ServiceInclude | undefined {
  if (!input) return undefined;
  let keys: string[];
  if (input === true || input === 'true') keys = ['patient', 'doctor', 'medicalRecord', 'items'];
  else if (Array.isArray(input)) keys = input;
  else keys = input.split(',').map(s => s.trim()).filter(Boolean);

  const include: Prisma.ServiceInclude = {};
  for (const k of keys) {
    switch (k) {
      case 'patient': include.patient = true; break;
      case 'doctor': include.doctor = true; break;
      case 'medicalRecord': include.medicalRecord = true; break;
      case 'items':
      case 'serviceItems':
        include.serviceItems = { include: { serviceItem: true } };
        break;
      default: break;
    }
  }
  return Object.keys(include).length ? include : undefined;
}