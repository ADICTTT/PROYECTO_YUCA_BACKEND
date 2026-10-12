import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CambiarCredencialesDto {
  @IsString()
  passwordActual: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'El usuario solo puede tener letras, números, punto, guion y guion bajo',
  })
  nuevoNombreUsuario?: string;

  @IsString()
  @MinLength(8)
  nuevaPassword: string;
}