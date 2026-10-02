import { Module } from '@nestjs/common';
import { SectoresService } from './sectores.service';
import { SectoresController } from './sectores.controller';

@Module({
  controllers: [SectoresController],
  providers: [SectoresService],
})
export class SectoresModule {}
