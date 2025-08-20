import {
  BadRequestException, Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseBoolPipe, ParseIntPipe,
  Patch, Post, Query, Req, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

import { ServicesService } from './services.service';
import { QueryServiceDto } from './dto/query-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServiceLineDto } from './items/dto/create-service-line.dto';
import { UpdateServiceLineDto } from './items/dto/update-service-line.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('services')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  private static readonly ALLOWED_INCLUDES = new Set(['patient', 'doctor', 'medicalRecord', 'items', 'serviceItems']);

  private resolveInclude(include?: string, includeAll?: boolean): string | true | undefined {
    if (includeAll && include) throw new BadRequestException('Do not supply both includeAll=true and include=...; choose one.');
    if (includeAll) return true;
    if (!include) return undefined;
    const parts = include.split(',').map(s => s.trim()).filter(Boolean);
    const unknown = parts.filter(p => !ServicesController.ALLOWED_INCLUDES.has(p));
    if (unknown.length) {
      throw new BadRequestException(
        `Invalid include keys: ${unknown.join(', ')}. Allowed: ${Array.from(ServicesController.ALLOWED_INCLUDES).join(', ')}.`,
      );
    }
    return parts.join(',');
  }

  private getActor(req: Request): { userId: number; role: UserRole } {
    const user: any = (req as any).user;
    if (!user || typeof user.id !== 'number' || !user.role) {
      throw new BadRequestException('Authenticated user context required');
    }
    return { userId: user.id, role: user.role as UserRole };
  }

  // READ (doctor, cashier, admin) — plus patient (own data only)
  @Get()
  @Roles(UserRole.doctor, UserRole.cashier, UserRole.admin, UserRole.patient)
  list(@Query() query: QueryServiceDto, @Req() req: Request) {
    const actor = this.getActor(req);
    return this.service.list(query, actor);
  }

  @Get(':id')
  @Roles(UserRole.doctor, UserRole.cashier, UserRole.admin, UserRole.patient)
  get(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request, // ← move required param BEFORE optional ones
    @Query('include') include?: string,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll?: boolean,
  ) {
    const actor = this.getActor(req);
    return this.service.getById(id, this.resolveInclude(include, includeAll), actor);
  }

  // WRITE (doctor; admin bypass via super-role)
  @Post()
  @Roles(UserRole.doctor)
  create(
    @Body() dto: CreateServiceDto,
    @Query('include') include?: string,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll?: boolean,
  ) {
    return this.service.create(dto, this.resolveInclude(include, includeAll));
  }

  @Patch(':id')
  @Roles(UserRole.doctor)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
    @Query('include') include?: string,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll?: boolean,
  ) {
    return this.service.update(id, dto, this.resolveInclude(include, includeAll));
  }

  @Delete(':id')
  @Roles(UserRole.doctor)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true };
  }

  // LINES (doctor; admin bypass via super-role)
  @Post(':id/items')
  @Roles(UserRole.doctor)
  addLine(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateServiceLineDto) {
    return this.service.addLine(id, dto);
  }

  @Patch(':id/items/:lineId')
  @Roles(UserRole.doctor)
  updateLine(
    @Param('id', ParseIntPipe) id: number,
    @Param('lineId', ParseIntPipe) lineId: number,
    @Body() dto: UpdateServiceLineDto,
  ) {
    return this.service.updateLine(id, lineId, dto);
  }

  @Delete(':id/items/:lineId')
  @Roles(UserRole.doctor)
  async removeLine(@Param('id', ParseIntPipe) id: number, @Param('lineId', ParseIntPipe) lineId: number) {
    await this.service.removeLine(id, lineId);
    return { success: true };
  }
}