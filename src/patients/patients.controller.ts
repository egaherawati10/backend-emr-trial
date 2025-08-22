import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';
import { PatientResponseDto, PaginatedPatientResponseDto } from './dto/patient-response.dto';
import { PatientsService } from './patients.service';
import { Can } from 'src/common/guards/can.decorator';

@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
export class PatientsController {
  constructor(private readonly service: PatientsService) {}

  @Post()
  @Can('Patient', 'create')
  @ApiCreatedResponse({ type: PatientResponseDto })
  @ApiConflictResponse({ description: 'Patient profile already exists for this user' })
  @ApiBadRequestResponse({ description: 'Invalid input or foreign key' })
  create(@Body() dto: CreatePatientDto) {
    return this.service.create(dto);
  }

  @Get()
  @Can('Patient', 'read')
  @ApiOkResponse({ type: PaginatedPatientResponseDto })
  findAll(@Query() q: QueryPatientDto) {
    return this.service.findMany(q);
  }

  @Get(':id')
  @Can('Patient', 'read')
  @ApiOkResponse({ type: PatientResponseDto })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Can('Patient', 'update')
  @ApiOkResponse({ type: PatientResponseDto })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  @ApiBadRequestResponse({ description: 'Invalid input or foreign key' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePatientDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Can('Patient', 'delete')
  @ApiOkResponse({ description: 'Soft-deleted' })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}