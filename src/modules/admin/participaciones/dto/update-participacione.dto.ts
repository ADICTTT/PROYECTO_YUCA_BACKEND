import { PartialType } from '@nestjs/swagger';
import { CreateParticipacioneDto } from './create-participacione.dto';

export class UpdateParticipacioneDto extends PartialType(CreateParticipacioneDto) {}
