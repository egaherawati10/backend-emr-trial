import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MedicalRecordsRepository } from './medical-records.repository';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsItemsController } from './medical-records.items.controller';
import { MEDICAL_RECORDS_SERVICE } from './medical-records.service.interface';

@Module({
  controllers: [MedicalRecordsItemsController],
  providers: [
    PrismaService,
    MedicalRecordsRepository,
    MedicalRecordsService,
    { provide: MEDICAL_RECORDS_SERVICE, useExisting: MedicalRecordsService },
  ],
  exports: [MEDICAL_RECORDS_SERVICE],
})
export class MedicalRecordsItemsModule {}