import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';
import { PatientHubService } from './patient-hub.service';
import { Can } from 'src/common/guards/can.decorator';

@ApiTags('patients.services')
@ApiBearerAuth()
@Controller('patients/:patientId/services')
export class PatientServicesController {
  constructor(private readonly svc: PatientHubService) {}

  @Get()
  @Can('Service', 'read')
  @ApiOkResponse({ description: 'List all services for the patient (paginated)' })
  list(
    @Req() req: any,
    @Param('patientId', ParseIntPipe) patientId: number,
    @Query() q: PaginationDto,
  ) {
    return this.svc.listServicesForPatient(req.user, patientId, q.page, q.limit);
  }
}