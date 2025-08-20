import {
  BadRequestException, Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseBoolPipe, ParseIntPipe,
  Patch, Post, Query, Req, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { PaymentsService } from './payments.service';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreatePaymentItemDto } from './items/dto/create-payment-item.dto';
import { UpdatePaymentItemDto } from './items/dto/update-payment-item.dto';

@Controller('payments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  private static readonly ALLOWED_INCLUDES = new Set([
    'medicalRecord', 'patient', 'items', 'items.prescriptionItem', 'items.serviceItem', 'items.deep',
  ]);

  private resolveInclude(include?: string, includeAll?: boolean): string | true | undefined {
    if (includeAll && include) throw new BadRequestException('Do not supply both includeAll=true and include=...; choose one.');
    if (includeAll) return true;
    if (!include) return undefined;
    const parts = include.split(',').map(s => s.trim()).filter(Boolean);
    const unknown = parts.filter(p => !PaymentsController.ALLOWED_INCLUDES.has(p));
    if (unknown.length) {
      throw new BadRequestException(
        `Invalid include keys: ${unknown.join(', ')}. Allowed: ${Array.from(PaymentsController.ALLOWED_INCLUDES).join(', ')}.`,
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

  // READ (broad roles) incl. patient self
  @Get()
  @Roles(
    UserRole.doctor,
    UserRole.pharmacist,
    UserRole.cashier,
    UserRole.registration_clerk,
    UserRole.admin,
    UserRole.patient,
  )
  list(@Query() query: QueryPaymentDto, @Req() req: Request) {
    const actor = this.getActor(req);
    return this.service.list(query, actor);
  }

  @Get(':id')
  @Roles(
    UserRole.doctor,
    UserRole.pharmacist,
    UserRole.cashier,
    UserRole.registration_clerk,
    UserRole.admin,
    UserRole.patient,
  )
  get(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request, // required param before optionals (TS rule)
    @Query('include') include?: string,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll?: boolean,
  ) {
    const actor = this.getActor(req);
    return this.service.getById(id, this.resolveInclude(include, includeAll), actor);
  }

  // WRITE (doctor + cashier + admin)
  @Post()
  @Roles(UserRole.doctor, UserRole.cashier, UserRole.admin)
  create(
    @Body() dto: CreatePaymentDto,
    @Query('include') include?: string,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll?: boolean,
  ) {
    return this.service.create(dto, this.resolveInclude(include, includeAll));
  }

  @Patch(':id')
  @Roles(UserRole.doctor, UserRole.cashier, UserRole.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentDto,
    @Query('include') include?: string,
    @Query('includeAll', new DefaultValuePipe(false), ParseBoolPipe) includeAll?: boolean,
  ) {
    return this.service.update(id, dto, this.resolveInclude(include, includeAll));
  }

  @Delete(':id')
  @Roles(UserRole.doctor, UserRole.cashier, UserRole.admin)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true };
  }

  // Items (doctor + cashier + admin)
  @Post(':id/items')
  @Roles(UserRole.doctor, UserRole.cashier, UserRole.admin)
  addItem(@Param('id', ParseIntPipe) id: number, @Body() dto: CreatePaymentItemDto) {
    return this.service.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  @Roles(UserRole.doctor, UserRole.cashier, UserRole.admin)
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdatePaymentItemDto,
  ) {
    return this.service.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @Roles(UserRole.doctor, UserRole.cashier, UserRole.admin)
  async removeItem(@Param('id', ParseIntPipe) id: number, @Param('itemId', ParseIntPipe) itemId: number) {
    await this.service.removeItem(id, itemId);
    return { success: true };
  }
}