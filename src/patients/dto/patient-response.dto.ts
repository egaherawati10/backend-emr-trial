import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

class MinimalUserDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty() username!: string;
  @ApiProperty() email!: string;
}

export class PatientResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() userId!: number;
  @ApiProperty() dob!: Date;
  @ApiProperty({ enum: Gender }) gender!: Gender;
  @ApiProperty() address!: string;
  @ApiProperty() phone!: string;
  @ApiProperty({ nullable: true }) clerkId!: number | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  @ApiProperty({ type: MinimalUserDto })
  user!: MinimalUserDto;

  @ApiProperty({ type: MinimalUserDto, nullable: true })
  clerk!: MinimalUserDto | null;
}

export class PaginatedPatientResponseDto {
  @ApiProperty({ type: [PatientResponseDto] })
  data!: PatientResponseDto[];

  @ApiProperty()
  meta!: { page: number; limit: number; total: number; totalPages: number };
}