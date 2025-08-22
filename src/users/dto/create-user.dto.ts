import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty() @IsString() @IsNotEmpty()
  name!: string;

  @ApiProperty() @IsString() @IsNotEmpty()
  username!: string;

  @ApiProperty() @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8)
  password!: string;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole' }) @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus', required: false })
  @IsOptional() @IsEnum(UserStatus)
  status?: UserStatus;
}