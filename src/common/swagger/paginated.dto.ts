import { ApiProperty } from '@nestjs/swagger';

export class PaginatedDto<T> {
  @ApiProperty({ example: 42 }) total!: number;
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 20 }) pageSize!: number;
  @ApiProperty({ isArray: true, type: Object }) data!: T[];
}