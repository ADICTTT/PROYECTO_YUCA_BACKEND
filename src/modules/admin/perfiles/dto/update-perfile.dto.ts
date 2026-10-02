import { PartialType } from '@nestjs/swagger';
import { CreatePerfileDto } from './create-perfile.dto';

export class UpdatePerfileDto extends PartialType(CreatePerfileDto) {}
