import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Gender } from '@prisma/client';

export class CreatePatientDto {
  @IsInt()
  userId: number;   // must link to existing User with role = patient

  @IsDateString()
  dob: Date;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsInt()
  clerkId: number;
}