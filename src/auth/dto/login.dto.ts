// src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty() @IsString() @IsNotEmpty()
  usernameOrEmail!: string;

  @ApiProperty() @IsString() @IsNotEmpty()
  password!: string;
}