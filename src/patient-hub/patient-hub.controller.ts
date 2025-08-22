import {
  Controller, Get, Post, Param, Query, Body, UseGuards,
  BadRequestException
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PatientHubService } from './patient-hub.service';
import { PatientParamDto, PaginationDto, DateRangeDto } from './dto/common.dto';
import { CreateRecordDto } from './dto/record.dto';
import { CreatePrescriptionDto } from './dto/prescription.dto';
import { CreateServiceDto } from './dto/service.dto';
import { CreatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PolicyGuard } from '@/common/auth/policy.guard';
import { Can } from '@/common/auth/can.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Role } from '@/common/auth/capabilities';

@ApiTags('patient-hub')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PolicyGuard)
@Controller('patient-hub/:patientId')
export class PatientHubController {
  constructor(private readonly svc: PatientHubService) {}

  @Get('summary')
  @Can('Patient', 'read')
  @ApiOkResponse({ description: 'Aggregated patient dashboard' })
  async summary(@Param() { patientId }: PatientParamDto) {
    return this.svc.getSummary(patientId);
  }

  @Get('records')
  @Can('Record', 'read')
  async listRecords(
    @Param() { patientId }: PatientParamDto,
    @Query() q: PaginationDto,
  ) {
    return this.svc.listRecords(patientId, q);
  }

  @Get('prescriptions')
  @Can('Prescription', 'read')
  async listRx(@Param() { patientId }: PatientParamDto, @Query() q: PaginationDto) {
    return this.svc.listPrescriptions(patientId, q);
  }

  @Get('services')
  @Can('Service', 'read')
  async listServices(@Param() { patientId }: PatientParamDto, @Query() q: PaginationDto) {
    return this.svc.listServices(patientId, q);
  }

  @Get('payments')
  @Can('Payment', 'read')
  async listPayments(
    @Param() { patientId }: PatientParamDto,
    @Query() q: PaginationDto & DateRangeDto,
  ) {
    return this.svc.listPayments(patientId, q);
  }

  // --- create ops ---
  @Post('records')
  @Can('Record', 'create')
  async createRecord(
    @Param() { patientId }: PatientParamDto,
    @Body() dto: CreateRecordDto,
    @CurrentUser() me: { id: number; role: Role },
  ) {
    return this.svc.createRecord(patientId, dto, me);
  }

  @Post('prescriptions')
  @Can('Prescription', 'create')
  async createPrescription(
    @Param() { patientId }: PatientParamDto,
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser() me: { id: number; role: Role },
  ) {
    if (!dto.items?.length) throw new BadRequestException('items[] required');
    return this.svc.createPrescription(patientId, dto, me);
  }

  @Post('services')
  @Can('Service', 'create')
  async createService(
    @Param() { patientId }: PatientParamDto,
    @Body() dto: CreateServiceDto,
    @CurrentUser() me: { id: number; role: Role },
  ) {
    return this.svc.createService(patientId, dto, me);
  }

  @Post('payments')
  @Can('Payment', 'create')
  async createPayment(
    @Param() { patientId }: PatientParamDto,
    @Body() dto: CreatePaymentDto,
    @CurrentUser() me: { id: number; role: Role },
  ) {
    return this.svc.createPayment(patientId, dto, me);
  }
}