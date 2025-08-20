import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe,
  UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';

import { MedicinesService } from './medicines.service';
import { QueryMedicineDto } from './dto/query-medicine.dto';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('medicines')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class MedicinesController {
  constructor(private readonly service: MedicinesService) {}

  // -------- READ (only doctor, pharmacist, admin) --------
  @Get()
  @Roles(UserRole.doctor, UserRole.pharmacist, UserRole.admin)
  list(@Query() query: QueryMedicineDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @Roles(UserRole.doctor, UserRole.pharmacist, UserRole.admin)
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  // -------- WRITE (pharmacist, admin) --------
  @Post()
  @Roles(UserRole.pharmacist, UserRole.admin)
  create(@Body() dto: CreateMedicineDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.pharmacist, UserRole.admin)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMedicineDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.pharmacist, UserRole.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}