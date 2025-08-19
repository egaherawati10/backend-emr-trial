import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UserRole } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('patients')
@UseGuards(RolesGuard) // apply role guard
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles(UserRole.admin, UserRole.doctor, UserRole.registration_clerk)
  findAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.registration_clerk, UserRole.patient)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.registration_clerk) // only clerks can create patient profiles
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.registration_clerk)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.remove(id);
  }
}