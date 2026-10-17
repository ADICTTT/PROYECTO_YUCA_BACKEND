import { IsInt, Max, Min } from 'class-validator';

export class ExtenderReservaDto {
  @IsInt()
  @Min(1)
  @Max(168)
  horas: number;
}