import { PartialType } from '@nestjs/swagger';
import { CreatePatientHubDto } from './create-patient-hub.dto';

export class UpdatePatientHubDto extends PartialType(CreatePatientHubDto) {}
