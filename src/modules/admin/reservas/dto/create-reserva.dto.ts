import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateReservaDto {
  @IsInt()
  @Min(1)
  standId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  companeroPerfilId?: number;
}