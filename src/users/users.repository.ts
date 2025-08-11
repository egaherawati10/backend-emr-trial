import { Injectable } from "@nestjs/common";
import { UsersRepositoryItf } from "./users.repository.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, User } from "@prisma/client";

export const UsersRepositoryToken = 'UsersRepositoryToken';

@Injectable()
export class UsersRepository implements UsersRepositoryItf {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async findById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { username } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({ where: { id }, data });
    }

    async remove(id: number): Promise<void> {
        await this.prisma.user.delete({ where: { id } });
    }
}