import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './patients.repository';

@Module({
  controllers: [PatientsController],
  providers: [PrismaService, PatientsService, PatientsRepository],
  exports: [PatientsService],
})
export class PatientsModule {}