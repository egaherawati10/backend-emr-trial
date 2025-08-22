import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordResponseDto } from './dto/medical-record-response.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { Can } from 'src/common/guards/can.decorator';
import { IMedicalRecordsService, MEDICAL_RECORDS_SERVICE } from './medical-records.service.interface';

@ApiTags('medical-records')
@ApiBearerAuth()
@Controller() // base path provided by RouterModule: /medical-records
export class MedicalRecordsItemsController {
  constructor(
    @Inject(MEDICAL_RECORDS_SERVICE)
    private readonly service: IMedicalRecordsService,
  ) {}

  @Get(':id')
  @Can('MedicalRecord', 'read')
  @ApiOkResponse({ type: MedicalRecordResponseDto })
  getOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.findById(id, { id: req.user.id, role: req.user.role });
  }

  @Patch(':id')
  @Can('MedicalRecord', 'update')
  @ApiOkResponse({ type: MedicalRecordResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedicalRecordDto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Can('MedicalRecord', 'delete')
  @ApiOkResponse({ description: 'Soft-deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}