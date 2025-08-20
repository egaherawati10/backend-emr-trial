import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma, ServiceItem } from '@prisma/client';
import { ServiceItemsRepository } from './service-items.repository';
import { QueryServiceItemDto } from './dto/query-service-item.dto';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import { IServiceItemsService } from './service-items.service.interface';

@Injectable()
export class ServiceItemsService implements IServiceItemsService {
  constructor(private readonly repo: ServiceItemsRepository) {}

  private handlePrisma(err: unknown, ctx: string): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case 'P2002': throw new ConflictException('Unique constraint failed.');
        case 'P2003': throw new BadRequestException('Invalid reference; foreign key constraint would be violated.');
        case 'P2025': throw new NotFoundException((err as any).meta?.cause ?? 'Record not found');
        default: throw new BadRequestException(`Database error (${err.code}) while ${ctx}.`);
      }
    }
    if (err instanceof Prisma.PrismaClientValidationError) throw new BadRequestException('Invalid data shape.');
    throw new InternalServerErrorException(`Unexpected error while ${ctx}.`);
  }

  async list(query: QueryServiceItemDto) {
    try {
      const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
      const where: Prisma.ServiceItemWhereInput = query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {};
      const [data, total] = await Promise.all([
        this.repo.findMany({ skip: (page - 1) * pageSize, take: pageSize, where, orderBy: { updatedAt: 'desc' } }),
        this.repo.count(where),
      ]);
      return { data, total, page, pageSize };
    } catch (err) { this.handlePrisma(err, 'listing service items'); }
  }

  async getById(id: number): Promise<ServiceItem> {
    try {
      const row = await this.repo.findById(id);
      if (!row) throw new NotFoundException(`ServiceItem ${id} not found`);
      return row;
    } catch (err) { this.handlePrisma(err, `getting ServiceItem ${id}`); }
  }

  async create(dto: CreateServiceItemDto): Promise<ServiceItem> {
    try {
      return await this.repo.create({ name: dto.name, price: dto.price });
    } catch (err) { this.handlePrisma(err, 'creating a service item'); }
  }

  async update(id: number, dto: UpdateServiceItemDto): Promise<ServiceItem> {
    try {
      await this.getById(id);
      const data: Prisma.ServiceItemUncheckedUpdateInput = {};
      if (dto.name !== undefined) data.name = dto.name;
      if (dto.price !== undefined) data.price = dto.price;
      return await this.repo.update(id, data);
    } catch (err) { this.handlePrisma(err, `updating ServiceItem ${id}`); }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.repo.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('Cannot delete ServiceItem because dependent rows exist (service lines).');
      }
      this.handlePrisma(err, `deleting ServiceItem ${id}`);
    }
  }
}