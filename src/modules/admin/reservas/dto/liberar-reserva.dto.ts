import { IsString, MaxLength, MinLength } from 'class-validator';

export class LiberarReservaDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  motivo: string;
}