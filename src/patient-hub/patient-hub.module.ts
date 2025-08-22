import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PatientHubService } from './patient-hub.service';
import { PatientServicesController } from './patient-services.controller';
import { PatientPaymentsController } from './patient-payments.controller';

@Module({
  controllers: [PatientServicesController, PatientPaymentsController],
  providers: [PrismaService, PatientHubService],
})
export class PatientHubModule {}