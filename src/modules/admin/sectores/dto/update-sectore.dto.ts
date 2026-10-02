import { PartialType } from '@nestjs/swagger';
import { CreateSectoreDto } from './create-sectore.dto';

export class UpdateSectoreDto extends PartialType(CreateSectoreDto) {}
