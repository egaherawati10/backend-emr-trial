import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe, DefaultValuePipe,
  BadRequestException, UsePipes, ValidationPipe, ParseBoolPipe,
  Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserRole } from '@prisma/client';

import { QueryMedicalRecordDto } from './dto/query-medical-record.dto';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

import { MedicalRecordService } from './medical-records.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('medical-records')
@UseGuards(AuthGuard('jwt'), RolesGuard) // all routes require auth; @Roles() narrows further
@UsePipes(new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
}))
export class MedicalRecordController {
  constructor(private readonly service: MedicalRecordService) {}

  /** Only these include keys are allowed. */
  private static readonly ALLOWED_INCLUDES = new Set([
    'patient', 'doctor', 'clerk', 'records', 'prescriptions', 'services', 'payments',
  ]);

  /** Normalize/validate include params. */
  private resolveIncludeParam(
    include?: string,
    includeAll?: boolean,
  ): string | true | undefined {
    if (includeAll && include) {
      throw new BadRequestException('Do not supply both includeAll=true and include=...; choose one.');
    }
    if (includeAll) return true;
    if (!include) return undefined;

    const parts = include.split(',').map(s => s.trim()).filter(Boolean);
    const unknown = parts.filter(p => !MedicalRecordController.ALLOWED_INCLUDES.has(p));
    if (unknown.length) {
      throw new BadRequestException(
        `Invalid include keys: ${unknown.join(', ')}. ` +
        `Allowed: ${Array.from(MedicalRecordController.ALLOWED_INCLUDES).join(', ')}.`
      );
    }
    return parts.join(',');
  }

  /** Safely extract authenticated user (id & role). */
  private getUserOrThrow(req: Request): { id: number; role: UserRole } {
    const user: any = (req as any).user;
    if (!user || typeof user.id !== 'number' || !user.role) {
      throw new BadRequestException('Authenticated user context required');
    }
    return { id: user.id as number, role: user.role as UserRole };
  }

  // ---------- READ (all authenticated roles) ----------
  @Get()
  async list(@Query() query: QueryMedicalRecordDto) {
    return this.service.list(query);
  }

  @Get(':id')
  async get(
    @Param('id', ParseIntPipe) id: number,
    @Query('include') include?: string,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll?: boolean,
  ) {
    const inc = this.resolveIncludeParam(include, includeAll);
    return this.service.getById(id, inc);
  }

  // ---------- WRITE (admin + registration_clerk) ----------
  @Post()
  @Roles(UserRole.admin, UserRole.registration_clerk)
  async create(
    @Body() dto: CreateMedicalRecordDto,
    @Query('include') include?: string,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll?: boolean,
  ) {
    const inc = this.resolveIncludeParam(include, includeAll);
    return this.service.create(dto, inc);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.registration_clerk)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedicalRecordDto,
    @Query('include') include?: string,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll?: boolean,
  ) {
    const inc = this.resolveIncludeParam(include, includeAll);
    return this.service.update(id, dto, inc);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.registration_clerk)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true };
  }

  // ---------- DOCTOR-ONLY SOAP RECORD CRUD (admin bypass via RolesGuard + service) ----------
  @Post(':id/records')
  @Roles(UserRole.doctor) // admin passes via RolesGuard super-role if implemented
  async addRecord(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateRecordDto,
    @Req() req: Request,
  ) {
    const { id: actorId, role } = this.getUserOrThrow(req);
    return this.service.addRecordByDoctor(id, actorId, dto, role);
  }

  @Patch(':id/records/:recordId')
  @Roles(UserRole.doctor)
  async updateRecord(
    @Param('id', ParseIntPipe) id: number,
    @Param('recordId', ParseIntPipe) recordId: number,
    @Body() dto: UpdateRecordDto,
    @Req() req: Request,
  ) {
    const { id: actorId, role } = this.getUserOrThrow(req);
    return this.service.updateRecordByDoctor(id, recordId, actorId, dto, role);
  }

  @Delete(':id/records/:recordId')
  @Roles(UserRole.doctor)
  async removeRecord(
    @Param('id', ParseIntPipe) id: number,
    @Param('recordId', ParseIntPipe) recordId: number,
    @Req() req: Request,
  ) {
    const { id: actorId, role } = this.getUserOrThrow(req);
    await this.service.removeRecordByDoctor(id, recordId, actorId, role);
    return { success: true };
  }
}