import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { PatientsModule } from './patients/patients.module';
import { PaymentsModule } from './payments/payments.module';
import { MedicinesModule } from './medicines/medicines.module';
import { ServiceItemsModule } from './service-items/service-items.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 6000,
          limit: 10,
        },
      ],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ServicesModule,
    PrescriptionsModule,
    PatientsModule,
    PaymentsModule,
    MedicalRecordsModule,
    MedicinesModule,
    ServiceItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
