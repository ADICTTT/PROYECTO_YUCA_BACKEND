// src/modules/stands/dto/create-stand.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CategoriaTipo } from '../../../../common/enums/categoria-tipo.enum';

export class CreateStandDto {
  @IsNotEmpty()
  @IsNumber()
  pisoId: number;

  @IsOptional()
  @IsNumber()
  sectorId?: number;

  @IsNotEmpty()
  @IsString()
  codigo: string;

  @IsNotEmpty()
  @IsNumber()
  precio: number;

  @IsNotEmpty()
  @IsEnum(CategoriaTipo)
  categoria: CategoriaTipo;

  @IsOptional()
  @IsNumber()
  posicionX?: number;

  @IsOptional()
  @IsNumber()
  posicionY?: number;

  @IsNotEmpty()
  @IsNumber()
  ancho: number;

  @IsNotEmpty()
  @IsNumber()
  alto: number;

  @IsOptional()
  @IsNumber()
  rotacion?: number;
}