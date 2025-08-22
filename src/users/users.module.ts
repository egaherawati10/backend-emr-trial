import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PolicyGuard } from 'src/common/guards/policy.guard';

@Module({
  controllers: [UsersController],
  providers: [
    PrismaService,
    { provide: 'IUsersRepository', useClass: UsersRepository },
    { provide: 'IUsersService', useClass: UsersService },
    Reflector,
    { provide: APP_GUARD, useClass: PolicyGuard },
  ],
  exports: [{ provide: 'IUsersService', useClass: UsersService }],
})
export class UsersModule {}