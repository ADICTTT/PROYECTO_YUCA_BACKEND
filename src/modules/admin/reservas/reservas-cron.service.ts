import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, LessThan } from 'typeorm';
import { Reserva } from './entities/reserva.entity';
import { EstadoReserva } from '../../../common/enums/estado-reserva.enum';

@Injectable()
export class ReservasCronService {
  private readonly logger = new Logger(ReservasCronService.name);

  constructor(private readonly dataSource: DataSource) {}

  // Cada 5 minutos pasa a VENCIDA toda reserva pendiente cuyo plazo ya terminó
  @Cron(CronExpression.EVERY_5_MINUTES)
  async liberarVencidas() {
    try {
      const r = await this.dataSource.getRepository(Reserva).update(
        { estado: EstadoReserva.PENDIENTE_PAGO, venceEn: LessThan(new Date()) },
        { estado: EstadoReserva.VENCIDA, motivoLiberacion: 'Vencida por falta de pago' },
      );
      if (r.affected) this.logger.log(`Reservas vencidas liberadas: ${r.affected}`);
    } catch (e) {
      this.logger.error('Error al liberar reservas vencidas', e as any);
    }
  }
}