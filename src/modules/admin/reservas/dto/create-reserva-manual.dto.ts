import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreateReservaManualDto {
  @IsInt()
  @Min(1)
  standId: number;

  @IsInt()
  @Min(1)
  titularPerfilId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  companeroPerfilId?: number;

  // true = se crea ya como CONFIRMADA (pagada)
  @IsOptional()
  @IsBoolean()
  pagada?: boolean;
}