// src/modules/stands/dto/update-stand.dto.ts
import { PartialType } from '@nestjs/mapped-types'; // O '@nestjs/swagger' si usas Swagger
import { CreateStandDto } from './create-stand.dto';

export class UpdateStandDto extends PartialType(CreateStandDto) {}