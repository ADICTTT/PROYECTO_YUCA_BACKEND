import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoReserva } from '../../../../common/enums/estado-reserva.enum';

export class FiltrarReservasDto {
  @IsOptional()
  @IsEnum(EstadoReserva)
  estado?: EstadoReserva;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  q?: string;
}