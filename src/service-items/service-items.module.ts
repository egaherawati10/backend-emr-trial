import { Module } from '@nestjs/common';
import { ServiceItemsController } from './service-items.controller';
import { ServiceItemsService } from './service-items.service';
import { ServiceItemsRepository } from './service-items.repository';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceItemsController],
  providers: [
    ServiceItemsService,
    ServiceItemsRepository,
    RolesGuard,
  ],
  exports: [ServiceItemsService],
})
export class ServiceItemsModule {}