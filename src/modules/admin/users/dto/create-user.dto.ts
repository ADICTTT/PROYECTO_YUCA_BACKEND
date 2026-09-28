import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength, minLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    username: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    @MaxLength(200)
    password: string;
}
