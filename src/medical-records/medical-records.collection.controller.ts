import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MedicalRecordsService } from './medical-records.service';
import { QueryMedicalRecordDto } from './dto/query-medical-record.dto';
import { CreateMedicalRecordForPatientDto } from './dto/create-medical-record.dto';
import { MedicalRecordResponseDto, PaginatedMedicalRecordResponseDto } from './dto/medical-record-response.dto';
import { Can } from 'src/common/guards/can.decorator';
import { IMedicalRecordsService, MEDICAL_RECORDS_SERVICE } from './medical-records.service.interface';

@ApiTags('patients.medical-records')
@ApiBearerAuth()
@Controller() // base path is provided by RouterModule: /patients/:patientId/medical-records
export class MedicalRecordsCollectionController {
  constructor(
    @Inject(MEDICAL_RECORDS_SERVICE)
    private readonly service: IMedicalRecordsService,
  ) {}

  @Get()
  @Can('MedicalRecord', 'read')
  @ApiOkResponse({ type: PaginatedMedicalRecordResponseDto })
  list(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Query() q: QueryMedicalRecordDto,
    @Req() req: any,
  ) {
    return this.service.listForPatient(patientId, q, { id: req.user.id, role: req.user.role });
  }

  @Get(':medicalRecordId')
  @Can('MedicalRecord', 'read')
  @ApiOkResponse({ type: MedicalRecordResponseDto })
  getOne(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    @Req() req: any,
  ) {
    return this.service.getOneForPatient(patientId, medicalRecordId, { id: req.user.id, role: req.user.role });
  }

  @Post()
  @Can('MedicalRecord', 'create')
  @ApiCreatedResponse({ type: MedicalRecordResponseDto })
  create(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Body() dto: CreateMedicalRecordForPatientDto,
    @Req() req: any,
  ) {
    return this.service.createForPatient(patientId, dto, req.user.id);
  }
}