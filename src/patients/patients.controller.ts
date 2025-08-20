import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  Logger,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UserRole } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    role: UserRole;
  };
}

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  private readonly logger = new Logger(PatientsController.name);

  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles(UserRole.admin, UserRole.doctor, UserRole.registration_clerk)
  async findAll() {
    try {
      return await this.patientsService.findAll();
    } catch (err) {
      this.logger.error('findAll failed', err?.stack || err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Failed to list patients');
    }
  }

  @Get(':id')
  @Roles(
    UserRole.admin,
    UserRole.doctor,
    UserRole.registration_clerk,
    UserRole.patient,
  )
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.patientsService.findOne(id, req.user.id, req.user.role);
    } catch (err) {
      this.logger.error(`findOne failed for id=${id}`, err?.stack || err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Failed to fetch patient');
    }
  }

  @Post()
  @Roles(UserRole.admin, UserRole.registration_clerk)
  async create(@Body() dto: CreatePatientDto, @Req() req: AuthenticatedRequest) {
    try {
      return await this.patientsService.create(dto, req.user.id, req.user.role);
    } catch (err) {
      this.logger.error('create failed', err?.stack || err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Failed to create patient');
    }
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.registration_clerk)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePatientDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.patientsService.update(
        id,
        dto,
        req.user.id,
        req.user.role,
      );
    } catch (err) {
      this.logger.error(`update failed for id=${id}`, err?.stack || err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Failed to update patient');
    }
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.registration_clerk)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      await this.patientsService.remove(id, req.user.id, req.user.role);
      return { message: 'Patient deleted' };
    } catch (err) {
      this.logger.error(`remove failed for id=${id}`, err?.stack || err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Failed to delete patient');
    }
  }
}