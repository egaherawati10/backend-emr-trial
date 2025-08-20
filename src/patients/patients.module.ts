import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './patients.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PatientsController],
  providers: [
    PatientsService, 
    PatientsRepository, 
    RolesGuard
  ],
  exports: [PatientsService],
})
export class PatientsModule {}