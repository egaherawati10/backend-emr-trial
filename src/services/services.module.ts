import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServicesRepository } from './services.repository';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ServicesController],
  providers: [
    ServicesService,
    ServicesRepository,
    RolesGuard,
  ],
  exports: [ServicesService],
})
export class ServicesModule {}