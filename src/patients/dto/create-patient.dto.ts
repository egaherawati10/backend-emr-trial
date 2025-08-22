import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty() @IsInt() @Min(1)
  userId!: number;

  @ApiProperty() @IsDateString()
  dob!: string;

  @ApiProperty({ enum: Gender }) @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty() @IsString() @IsNotEmpty()
  address!: string;

  @ApiProperty() @IsString() @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  clerkId?: number;
}