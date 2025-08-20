import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsRepository } from './prescriptions.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PrescriptionsController],
  providers: [
    PrescriptionsService, 
    PrescriptionsRepository, 
    RolesGuard
  ],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}