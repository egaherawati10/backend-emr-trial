import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.getUserByUsername(username);
      if (!user) return null;

      const isPasswordValid = await bcrypt.compare(password, user.password);
      return isPasswordValid ? user : null;
    } catch (error) {
      throw new InternalServerErrorException('Error validating user');
    }
  }

  login(user: User): { access_token: string; user: Pick<User, 'id' | 'name' | 'email' | 'role'> } {
    try {
      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role,
      };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Login failed');
    }
  }

  async register(dto: RegisterDto): Promise<Omit<User, 'password'>> {
    try {
      const { name, username, email, password, status, role } = dto;

      const existing = await this.usersService.getUserByEmail(email);
      if (existing) {
        throw new ConflictException('Email is already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await this.usersService.createUser({
        name,
        username,
        email,
        password: hashedPassword,
        status,
        role,
      });

      const { password: _removed, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Registration failed');
    }
  }
}
