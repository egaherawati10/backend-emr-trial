import { Module } from '@nestjs/common';
import { MedicalRecordController } from './medical-records.controller';
import { MedicalRecordRepository } from './medical-records.repository';
import { MedicalRecordService } from './medical-records.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MedicalRecordController],
  providers: [
    MedicalRecordRepository, 
    MedicalRecordService],
  exports: [MedicalRecordService],
})
export class MedicalRecordsModule {}