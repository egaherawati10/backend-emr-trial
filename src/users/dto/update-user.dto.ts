import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  username?: string;

  @ApiPropertyOptional() @IsOptional() @IsEmail()
  email?: string;

  @ApiPropertyOptional({ minLength: 8 }) @IsOptional() @IsString() @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ enum: UserRole, enumName: 'UserRole' })
  @IsOptional() @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus, enumName: 'UserStatus' })
  @IsOptional() @IsEnum(UserStatus)
  status?: UserStatus;
}