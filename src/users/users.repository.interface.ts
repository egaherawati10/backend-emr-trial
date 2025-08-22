import { Prisma, UserRole, UserStatus } from '@prisma/client';

export type SafeUserSelect = {
  id: true; name: true; username: true; email: true;
  role: true; status: true; createdAt: true; updatedAt: true;
};

export interface IUsersRepository {
  create(data: Prisma.UserCreateInput): Promise<Prisma.UserGetPayload<{ select: SafeUserSelect }>>;
  findById(id: number): Promise<Prisma.UserGetPayload<{ select: SafeUserSelect }> | null>;
  findMany(params: {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    page: number;
    limit: number;
    sortBy: 'createdAt' | 'updatedAt' | 'name' | 'username' | 'email';
    order: 'asc' | 'desc';
  }): Promise<{ data: Prisma.UserGetPayload<{ select: SafeUserSelect }>[]; total: number }>;
  update(id: number, data: Prisma.UserUpdateInput): Promise<Prisma.UserGetPayload<{ select: SafeUserSelect }>>;
  delete(id: number): Promise<void>;
}