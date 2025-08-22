import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';
import { PatientHubService } from './patient-hub.service';
import { Can } from 'src/common/guards/can.decorator';

@ApiTags('patients.payments')
@ApiBearerAuth()
@Controller('patients/:patientId/payments')
export class PatientPaymentsController {
  constructor(private readonly svc: PatientHubService) {}

  @Get()
  @Can('Payment', 'read')
  @ApiOkResponse({ description: 'List all payments for the patient (paginated)' })
  list(
    @Req() req: any,
    @Param('patientId', ParseIntPipe) patientId: number,
    @Query() q: PaginationDto,
  ) {
    return this.svc.listPaymentsForPatient(req.user, patientId, q.page, q.limit);
  }
}