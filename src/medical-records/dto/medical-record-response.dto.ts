import { ApiProperty } from '@nestjs/swagger';

class MinimalUser {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty() username!: string;
  @ApiProperty() email!: string;
}

export class MedicalRecordResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() patientId!: number;
  @ApiProperty() doctorId!: number;
  @ApiProperty() clerkId!: number;
  @ApiProperty() visitDate!: Date;
  @ApiProperty() diagnosis!: string;
  @ApiProperty({ nullable: true }) notes!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty({ nullable: true }) createdById!: number | null;
  @ApiProperty({ nullable: true }) updatedById!: number | null;

  @ApiProperty({ type: MinimalUser }) doctor!: MinimalUser;
  @ApiProperty({ type: MinimalUser }) clerk!: MinimalUser;
}

export class PaginatedMedicalRecordResponseDto {
  @ApiProperty({ type: [MedicalRecordResponseDto] })
  data!: MedicalRecordResponseDto[];

  @ApiProperty()
  meta!: { page: number; limit: number; total: number; totalPages: number };
}