// src/modules/admin/stands/dto/create-stand.dto.ts
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
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

  // ───────── Datos de la mesa (opcionales) ─────────

  @IsOptional()
  @IsString()
  @MaxLength(60)
  medidas?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  sillas?: number | null;

  @IsOptional()
  @IsBoolean()
  incluyeMerienda?: boolean;

  @IsOptional()
  @IsBoolean()
  bajoTecho?: boolean;

  @IsOptional()
  @IsString()
  descripcion?: string | null;
}