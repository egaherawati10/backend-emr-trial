import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
  import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { IUsersService } from './users.service.interface';
import { IUsersRepository } from './users.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService implements IUsersService {
  constructor(private readonly repo: IUsersRepository) {}

  private toResponse(u: any): UserResponseDto {
    // Already selected to safe fields in repo
    return u as UserResponseDto;
  }

  private mapPrismaError(e: any): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        const target = (e.meta?.target as string[])?.join(', ') || 'unique field';
        throw new ConflictException(`Duplicate value for ${target}`);
      }
    }
    throw e;
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const hashed = await bcrypt.hash(dto.password, 10);
      const created = await this.repo.create({
        name: dto.name,
        username: dto.username,
        email: dto.email,
        password: hashed,
        role: dto.role,
        status: dto.status ?? 'active',
      } as any);
      return this.toResponse(created);
    } catch (e) {
      this.mapPrismaError(e);
    }
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.toResponse(user);
  }

  async findMany(q: QueryUserDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const { data, total } = await this.repo.findMany({
      search: q.search,
      role: q.role,
      status: q.status,
      page,
      limit,
      sortBy: q.sortBy ?? 'createdAt',
      order: q.order ?? 'desc',
    });
    const totalPages = Math.ceil(total / limit) || 1;
    return { data: data.map(this.toResponse), meta: { page, limit, total, totalPages } };
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const data: any = { ...dto };
      if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
      const updated = await this.repo.update(id, data);
      return this.toResponse(updated);
    } catch (e) {
      this.mapPrismaError(e);
    }
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}