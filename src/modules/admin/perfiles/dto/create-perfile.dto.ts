import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Type, Transform } from 'class-transformer'; // <--- Importante
import { CategoriaTipo } from '../../../../common/enums/categoria-tipo.enum';

export class CreateRedSocialDto {
  @IsString()
  @IsNotEmpty()
  plataforma: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreatePerfileDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre real es obligatorio' })
  nombreReal: string;

  @IsString()
  @IsNotEmpty({ message: 'El celular es obligatorio' })
  celular: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre comercial o artístico es obligatorio' })
  nombreComercial: string;

  @IsEnum(CategoriaTipo, { message: 'La categoría seleccionada no es válida' })
  @IsNotEmpty()
  categoria: CategoriaTipo;

  @IsString()
  @IsNotEmpty({ message: 'El usuario de Instagram es obligatorio' })
  instagram: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value?.trim() === '' ? undefined : value))
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede superar los 500 caracteres' })
  descripcion?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value?.trim() === '' ? undefined : value)) // <--- Convierte "" en undefined
  @IsString()
  @IsUrl({}, { message: 'El portafolio debe ser una URL válida' })
  portafolioUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRedSocialDto)
  redesSociales?: CreateRedSocialDto[];
}