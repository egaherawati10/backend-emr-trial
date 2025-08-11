import { UserRole, UserStatus } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsString()
    @IsNotEmpty()
    username: string;
    
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string;
    
    @IsEnum(UserStatus)
    @IsNotEmpty()
    status: UserStatus;
    
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}
