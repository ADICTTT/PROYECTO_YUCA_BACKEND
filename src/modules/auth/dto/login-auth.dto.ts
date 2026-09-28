import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class LoginAuthDto{
    @IsEmail()
    @IsNotEmpty()
    @MinLength(6)
    @ApiProperty()
    @MaxLength(30)
    email: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(255)
    password: string;
}