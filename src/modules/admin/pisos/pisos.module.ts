import { Module } from '@nestjs/common';
import { PisosService } from './pisos.service';
import { PisosController } from './pisos.controller';

@Module({
  controllers: [PisosController],
  providers: [PisosService],
})
export class PisosModule {}
