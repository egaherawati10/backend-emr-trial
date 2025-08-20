import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query,
  UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';

import { ServiceItemsService } from './service-items.service';
import { QueryServiceItemDto } from './dto/query-service-item.dto';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('service-items')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class ServiceItemsController {
  constructor(private readonly service: ServiceItemsService) {}

  // READ (all roles EXCEPT patient)
  @Get()
  @Roles(
    UserRole.doctor,
    UserRole.pharmacist,
    UserRole.cashier,
    UserRole.registration_clerk,
    UserRole.admin, // optional: admin super-role could be omitted if handled by guard
  )
  list(@Query() query: QueryServiceItemDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @Roles(
    UserRole.doctor,
    UserRole.pharmacist,
    UserRole.cashier,
    UserRole.registration_clerk,
    UserRole.admin,
  )
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  // WRITE (cashier + admin)
  @Post()
  @Roles(UserRole.cashier, UserRole.admin)
  create(@Body() dto: CreateServiceItemDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.cashier, UserRole.admin)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceItemDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.cashier, UserRole.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}