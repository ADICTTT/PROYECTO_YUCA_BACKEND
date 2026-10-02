import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { EstadoPerfil } from '../../../../common/enums/estado-perfil.enum';

export class UpdateEstadoPerfilDto {
  @IsEnum(EstadoPerfil, { message: 'El estado enviado no es válido' })
  @IsOptional()
  estado: EstadoPerfil;
}