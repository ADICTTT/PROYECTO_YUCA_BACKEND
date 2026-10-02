import { PartialType } from '@nestjs/swagger';
import { CreatePisoDto } from './create-piso.dto';

export class UpdatePisoDto extends PartialType(CreatePisoDto) {}
