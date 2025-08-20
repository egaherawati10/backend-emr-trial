import {
  BadRequestException, Controller, DefaultValuePipe, Delete, Get,
  Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Body, Query,
  UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';

import { PrescriptionsService } from './prescriptions.service';
import { QueryPrescriptionDto } from './dto/query-prescription.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { CreatePrescriptionItemDto } from './items/dto/create-prescription-item.dto';
import { UpdatePrescriptionItemDto } from './items/dto/update-prescription-item.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('prescriptions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class PrescriptionsController {
  constructor(private readonly service: PrescriptionsService) {}

  private static readonly ALLOWED_INCLUDES = new Set(['patient','doctor','pharmacist','medicalRecord','items']);

  private resolveInclude(include?: string, includeAll?: boolean): string | true | undefined {
    if (includeAll && include) throw new BadRequestException('Do not supply both includeAll=true and include=...; choose one.');
    if (includeAll) return true;
    if (!include) return undefined;
    const parts = include.split(',').map(s => s.trim()).filter(Boolean);
    const unknown = parts.filter(p => !PrescriptionsController.ALLOWED_INCLUDES.has(p));
    if (unknown.length) {
      throw new BadRequestException(
        `Invalid include keys: ${unknown.join(', ')}. Allowed: ${Array.from(PrescriptionsController.ALLOWED_INCLUDES).join(', ')}.`
      );
    }
    return parts.join(',');
  }

  // -------- READ (any authenticated role) --------
  @Get()
  list(@Query() query: QueryPrescriptionDto) {
    return this.service.list(query);
  }

  @Get(':id')
  get(
    @Param('id', ParseIntPipe) id: number,
    @Query('include') include?: string,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll?: boolean,
  ) {
    return this.service.getById(id, this.resolveInclude(include, includeAll));
  }

  // -------- WRITE (doctor, pharmacist, admin) --------
  @Post()
  @Roles(UserRole.doctor, UserRole.pharmacist, UserRole.admin)
  create(
    @Body() dto: CreatePrescriptionDto,
    @Query('include') include?: string,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll?: boolean,
  ) {
    return this.service.create(dto, this.resolveInclude(include, includeAll));
  }

  @Patch(':id')
  @Roles(UserRole.doctor, UserRole.pharmacist, UserRole.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePrescriptionDto,
    @Query('include') include?: string,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll?: boolean,
  ) {
    return this.service.update(id, dto, this.resolveInclude(include, includeAll));
  }

  @Delete(':id')
  @Roles(UserRole.doctor, UserRole.pharmacist, UserRole.admin)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true };
  }

  // -------- ITEMS (doctor, pharmacist, admin) --------
  @Post(':id/items')
  @Roles(UserRole.doctor, UserRole.pharmacist, UserRole.admin)
  addItem(@Param('id', ParseIntPipe) id: number, @Body() dto: CreatePrescriptionItemDto) {
    return this.service.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  @Roles(UserRole.doctor, UserRole.pharmacist, UserRole.admin)
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdatePrescriptionItemDto,
  ) {
    return this.service.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @Roles(UserRole.doctor, UserRole.pharmacist, UserRole.admin)
  async removeItem(@Param('id', ParseIntPipe) id: number, @Param('itemId', ParseIntPipe) itemId: number) {
    await this.service.removeItem(id, itemId);
    return { success: true };
  }
}