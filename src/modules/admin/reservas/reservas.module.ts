import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { ReservasCronService } from './reservas-cron.service';

@Module({
  controllers: [ReservasController],
  providers: [ReservasService, ReservasCronService],
})
export class ReservasModule {}