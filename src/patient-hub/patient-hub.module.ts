import { Module } from '@nestjs/common';
import { PatientHubService } from './patient-hub.service';
import { PatientHubController } from './patient-hub.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PatientHubController],
  providers: [PatientHubService, PrismaService],
  exports: [PatientHubService],
})
export class PatientHubModule {}