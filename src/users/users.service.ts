import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersServiceItf } from './users.service.interface';
import { UsersRepositoryItf, UsersRepositoryToken } from './users.repository.interface';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService implements UsersServiceItf {
  constructor(
    @Inject(UsersRepositoryToken)
    private readonly usersRepository: UsersRepositoryItf,
  ) {}

  getAllUsers(): Promise<User[]> {
      return this.usersRepository.findAll();
  }

  getUserById(id: number): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  getUserByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.usersRepository.create(data);
  }

  updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.usersRepository.update(id, data);
  }

  removeUser(id: number): Promise<void> {
    return this.usersRepository.remove(id);
  }
}
