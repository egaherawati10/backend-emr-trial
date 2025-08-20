import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class CreatePatientDto {
  @Type(() => Number)
  @IsInt()
  userId: number;

  @IsDateString()
  dob: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clerkId?: number;
}