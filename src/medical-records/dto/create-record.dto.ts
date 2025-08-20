import { IsOptional, IsString } from 'class-validator';

export class CreateRecordDto {
  @IsOptional() @IsString()
  subjective?: string;

  @IsOptional() @IsString()
  objective?: string;

  @IsOptional() @IsString()
  assessment?: string;

  @IsOptional() @IsString()
  planning?: string;
}