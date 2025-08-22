import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class HubQueryDto {
  @ApiProperty({ required: false, example: 10, minimum: 1, maximum: 50 })
  @IsOptional() @IsInt() @Min(1) @Max(50)
  take?: number = 10;
}

/** Basic patient identity, merged from PatientProfile + User */
export class PatientBasicDto {
  @ApiProperty() id!: number;              // PatientProfile.id
  @ApiProperty() userId!: number;          // User.id
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
  @ApiProperty() username!: string;

  @ApiProperty() dob!: Date;
  @ApiProperty() gender!: string;
  @ApiProperty() address!: string;
  @ApiProperty() phone!: string;
}

export class MedicalRecordSummaryDto {
  @ApiProperty() id!: number;
  @ApiProperty() visitDate!: Date;
  @ApiProperty() diagnosis!: string;
  @ApiProperty({ required: false }) doctorName?: string | null;
  @ApiProperty() soapCount!: number; // Record[]
}

export class PrescriptionSummaryDto {
  @ApiProperty() id!: number;
  @ApiProperty() dateIssued!: Date;
  @ApiProperty({ required: false }) doctorName?: string | null;
  @ApiProperty() itemCount!: number; // PrescriptionItem[]
}

export class ServiceSummaryDto {
  @ApiProperty() id!: number;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() itemCount!: number; // ServiceOnServiceItem[]
}

export class PaymentSummaryDto {
  @ApiProperty() id!: number;
  @ApiProperty() date!: Date;
  @ApiProperty() status!: string;
  @ApiProperty() method!: string;
  @ApiProperty() totalAmount!: number;
  @ApiProperty() itemCount!: number; // PaymentItem[]
}

export class HubSummaryDto {
  @ApiProperty() patient!: PatientBasicDto;
  @ApiProperty() medicalRecordCount!: number;
  @ApiProperty() soapRecordCount!: number;
  @ApiProperty() prescriptionCount!: number;
  @ApiProperty() serviceCount!: number;
  @ApiProperty() paymentCount!: number;
  @ApiProperty({ required: false }) lastVisitDate?: Date | null;
}

export class PatientHubDto {
  @ApiProperty() summary!: HubSummaryDto;

  @ApiProperty({ type: [MedicalRecordSummaryDto] })
  recentMedicalRecords!: MedicalRecordSummaryDto[];

  @ApiProperty({ type: [PrescriptionSummaryDto] })
  recentPrescriptions!: PrescriptionSummaryDto[];

  @ApiProperty({ type: [ServiceSummaryDto] })
  recentServices!: ServiceSummaryDto[];

  @ApiProperty({ type: [PaymentSummaryDto] })
  recentPayments!: PaymentSummaryDto[];
}