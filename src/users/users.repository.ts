import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUsersRepository, SafeUserSelect } from './users.repository.interface';

const safeSelect: SafeUserSelect = {
  id: true, name: true, username: true, email: true,
  role: true, status: true, createdAt: true, updatedAt: true,
};

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data, select: safeSelect });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id }, select: safeSelect });
  }

  async findMany(params: {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    page: number;
    limit: number;
    sortBy: 'createdAt' | 'updatedAt' | 'name' | 'username' | 'email';
    order: 'asc' | 'desc';
  }) {
    const { search, role, status, page, limit, sortBy, order } = params;

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: safeSelect,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: safeSelect,
      });
    } catch (e: any) {
      if (e?.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }

  async delete(id: number) {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('User not found');
      throw e;
    }
  }
}