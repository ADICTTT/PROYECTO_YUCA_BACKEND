import { ApiProperty } from "@nestjs/swagger";
import { Matches, IsString, MaxLength, MinLength, minLength } from "class-validator";
import { Transform } from 'class-transformer';

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    username: string;

    @ApiProperty()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toLowerCase().replace(/^@/, '') : value,
    )
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[a-z0-9._@-]+$/, {
        message: 'El usuario solo puede tener letras, números, punto, guion y guion bajo',
    })
    email: string; // ahora funciona como "usuario" de login


    @ApiProperty()
    @IsString()
    @MinLength(6)
    @MaxLength(200)
    password: string;
}
