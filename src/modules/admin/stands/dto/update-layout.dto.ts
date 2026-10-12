import { IsArray, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class StandLayoutItemDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNumber()
  posicionX: number;

  @IsNumber()
  posicionY: number;

  @IsNumber()
  ancho: number;

  @IsNumber()
  alto: number;

  @IsNumber()
  rotacion: number;
}

export class UpdateLayoutDto {
  @IsArray()
  @Type(() => StandLayoutItemDto)
  stands: StandLayoutItemDto[];
}