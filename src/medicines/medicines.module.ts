import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';
import { MedicinesRepository } from './medicines.repository';

@Module({
  imports: [PrismaModule],
  controllers: [MedicinesController],
  providers: [
    MedicinesService, 
    MedicinesRepository, 
    RolesGuard
  ],
  exports: [MedicinesService],
})
export class MedicinesModule {}