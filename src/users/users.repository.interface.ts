import { Prisma, User } from "@prisma/client";

export const UsersRepositoryToken = 'UsersRepositoryToken';

export interface UsersRepositoryItf {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  update(id: number, data: Prisma.UserUpdateInput): Promise<User>;
  remove(id: number): Promise<void>;
}