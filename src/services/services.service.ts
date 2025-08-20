import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Service, ServiceOnServiceItem as ServiceLine, UserRole } from '@prisma/client';
import { IServicesService, IncludeParam, Actor } from './services.service.interface';
import { ServicesRepository, buildServiceInclude } from './services.repository';
import { QueryServiceDto } from './dto/query-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServiceLineDto } from './items/dto/create-service-line.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateServiceLineDto } from './items/dto/update-service-line.dto';

@Injectable()
export class ServicesService implements IServicesService {
  constructor(
    private readonly repo: ServicesRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ---- helpers --------------------------------------------------------------

  private async resolvePatientProfileIdOrThrow(userId: number): Promise<number> {
    const pp = await this.prisma.patientProfile.findUnique({ where: { userId } });
    if (!pp) throw new ForbiddenException('No patient profile found for this user.');
    return pp.id;
  }

  private setIfDefined<T extends object>(o: T, k: string, v: unknown) {
    if (v !== undefined) (o as any)[k] = v;
  }

  private handlePrisma(err: unknown, ctx: string): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const target = Array.isArray((err as any).meta?.target)
        ? (err as any).meta?.target.join(', ')
        : String((err as any).meta?.target ?? '');
      switch (err.code) {
        case 'P2002': {
          if (String(target).includes('serviceId') && String(target).includes('serviceItemId')) {
            throw new ConflictException('This service already contains that item. Use update to change quantity/price.');
          }
          throw new ConflictException(`Unique constraint failed${target ? ` on: ${target}` : ''}`);
        }
        case 'P2003':
          throw new BadRequestException('Invalid reference; foreign key constraint would be violated.');
        case 'P2025':
          throw new NotFoundException((err as any).meta?.cause ?? 'Record not found');
        case 'P2000':
          throw new BadRequestException('One of the provided values is too long for its column.');
        case 'P2011':
          throw new BadRequestException(`Null constraint violation${target ? ` on: ${target}` : ''}`);
        case 'P2014':
          throw new BadRequestException('Relation constraint violation.');
        default:
          throw new BadRequestException(`Database error (${err.code}) while ${ctx}.`);
      }
    }
    if (err instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException('Invalid data shape.');
    }
    throw new InternalServerErrorException(`Unexpected error while ${ctx}.`);
  }

  // ---- Service CRUD (READ has actor-based scoping) --------------------------

  async list(query: QueryServiceDto, actor: Actor) {
    try {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 20;

      let where: Prisma.ServiceWhereInput = {
        ...(query.doctorId ? { doctorId: query.doctorId } : {}),
        ...(query.medicalRecordId ? { medicalRecordId: query.medicalRecordId } : {}),
      };

      // patient can only see self
      if (actor.role === 'patient') {
        const patientProfileId = await this.resolvePatientProfileIdOrThrow(actor.userId);
        where = { ...where, patientId: patientProfileId };
      } else {
        // non-patient can filter by patientId if provided
        if (query.patientId) where = { ...where, patientId: query.patientId };
      }

      const orderBy: Prisma.ServiceOrderByWithRelationInput = {
        [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
      };
      const include = buildServiceInclude(query.includeAll ? true : query.include);

      const [data, total] = await Promise.all([
        this.repo.findMany({ skip: (page - 1) * pageSize, take: pageSize, where, orderBy, include }),
        this.repo.count(where),
      ]);

      return { data, total, page, pageSize };
    } catch (err) {
      this.handlePrisma(err, 'listing services');
    }
  }

  async getById(id: number, include: IncludeParam | undefined, actor: Actor): Promise<Service> {
    try {
      const s = await this.repo.findById(id, buildServiceInclude(include));
      if (!s) throw new NotFoundException(`Service ${id} not found`);

      if (actor.role === 'patient') {
        const patientProfileId = await this.resolvePatientProfileIdOrThrow(actor.userId);
        if (s.patientId !== patientProfileId) {
          throw new ForbiddenException('You can only view your own services.');
        }
      }
      return s;
    } catch (err) {
      this.handlePrisma(err, `getting Service ${id}`);
    }
  }

  // WRITE — controller enforces RBAC (doctor; admin via super-role)
  async create(dto: CreateServiceDto, include?: IncludeParam): Promise<Service> {
    try {
      const data: Prisma.ServiceUncheckedCreateInput = {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        medicalRecordId: dto.medicalRecordId,
      };
      return await this.repo.create(data, buildServiceInclude(include));
    } catch (err) {
      this.handlePrisma(err, 'creating a service');
    }
  }

  async update(id: number, dto: UpdateServiceDto, include?: IncludeParam): Promise<Service> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NotFoundException(`Service ${id} not found`);

      const data: Prisma.ServiceUncheckedUpdateInput = {};
      this.setIfDefined(data, 'patientId', dto.patientId);
      this.setIfDefined(data, 'doctorId', dto.doctorId);
      this.setIfDefined(data, 'medicalRecordId', dto.medicalRecordId);
      return await this.repo.update(id, data, buildServiceInclude(include));
    } catch (err) {
      this.handlePrisma(err, `updating Service ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.repo.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('Cannot delete Service because dependent lines or payments exist.');
      }
      this.handlePrisma(err, `deleting Service ${id}`);
    }
  }

  // ---- Line items (ServiceOnServiceItem) ------------------------------------

  async addLine(serviceId: number, dto: CreateServiceLineDto): Promise<ServiceLine> {
    try {
      // ensure parent exists
      const svc = await this.repo.findById(serviceId);
      if (!svc) throw new NotFoundException(`Service ${serviceId} not found`);

      // ensure catalog item exists
      const si = await this.prisma.serviceItem.findUnique({ where: { id: dto.serviceItemId } });
      if (!si) throw new NotFoundException(`ServiceItem ${dto.serviceItemId} not found`);

      // prevent duplicate (@@unique([serviceId, serviceItemId]))
      const existing = await this.repo.findLineByServiceAndItem(serviceId, dto.serviceItemId);
      if (existing) {
        throw new ConflictException('This service already contains that item. Use update to change quantity/price.');
      }

      const price = dto.price ?? si.price;

      const data: Prisma.ServiceOnServiceItemUncheckedCreateInput = {
        serviceId,
        serviceItemId: dto.serviceItemId,
        quantity: dto.quantity,
        price,
      };
      return await this.repo.createLine(data);
    } catch (err) {
      this.handlePrisma(err, `adding line to Service ${serviceId}`);
    }
  }

  async updateLine(serviceId: number, lineId: number, dto: UpdateServiceLineDto): Promise<ServiceLine> {
    try {
      const line = await this.repo.findLineById(lineId);
      if (!line) throw new NotFoundException(`Service line ${lineId} not found`);
      if (line.serviceId !== serviceId) throw new ForbiddenException('Line does not belong to this Service');

      const data: Prisma.ServiceOnServiceItemUncheckedUpdateInput = {};
      this.setIfDefined(data, 'quantity', dto.quantity);

      if (dto.serviceItemId !== undefined) {
        const si = await this.prisma.serviceItem.findUnique({ where: { id: dto.serviceItemId } });
        if (!si) throw new NotFoundException(`ServiceItem ${dto.serviceItemId} not found`);

        // ensure no @@unique conflict with another line
        const duplicate = await this.repo.findLineByServiceAndItem(serviceId, dto.serviceItemId);
        if (duplicate && duplicate.id !== lineId) {
          throw new ConflictException('This service already contains that item. Use update on the existing line.');
        }

        data.serviceItemId = dto.serviceItemId;
        if (dto.price === undefined) data.price = si.price; // refresh price unless explicitly provided
      }

      if (dto.price !== undefined) data.price = dto.price;

      return await this.repo.updateLine(lineId, data);
    } catch (err) {
      this.handlePrisma(err, `updating line ${lineId} on Service ${serviceId}`);
    }
  }

  async removeLine(serviceId: number, lineId: number): Promise<void> {
    try {
      const line = await this.repo.findLineById(lineId);
      if (!line) throw new NotFoundException(`Service line ${lineId} not found`);
      if (line.serviceId !== serviceId) throw new ForbiddenException('Line does not belong to this Service');
      await this.repo.deleteLine(lineId);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('Cannot delete line because dependent payment items exist.');
      }
      this.handlePrisma(err, `deleting line ${lineId} on Service ${serviceId}`);
    }
  }
}