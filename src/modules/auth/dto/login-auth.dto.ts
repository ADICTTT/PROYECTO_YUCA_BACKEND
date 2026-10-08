import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class LoginAuthDto{
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @ApiProperty()
    email: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(255)
    password: string;
}