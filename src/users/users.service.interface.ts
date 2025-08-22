import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

export interface IUsersService {
  create(dto: CreateUserDto): Promise<UserResponseDto>;
  findById(id: number): Promise<UserResponseDto>;
  findMany(q: QueryUserDto): Promise<{ data: UserResponseDto[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;
  update(id: number, dto: UpdateUserDto): Promise<UserResponseDto>;
  delete(id: number): Promise<void>;
}