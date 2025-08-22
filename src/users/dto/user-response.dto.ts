import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty() username!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ enum: UserRole }) role!: UserRole;
  @ApiProperty({ enum: UserStatus }) status!: UserStatus;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class PaginatedUserResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data!: UserResponseDto[];

  @ApiProperty()
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}