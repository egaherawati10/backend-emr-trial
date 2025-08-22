import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';

export class QueryUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole, enumName: 'UserRole' })
  @IsOptional() @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus, enumName: 'UserStatus' })
  @IsOptional() @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value)) @IsOptional() @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => Number(value)) @IsOptional() @IsInt() @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['createdAt', 'updatedAt', 'name', 'username', 'email'], default: 'createdAt' })
  @IsOptional() @IsIn(['createdAt', 'updatedAt', 'name', 'username', 'email'])
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'username' | 'email' = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional() @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}