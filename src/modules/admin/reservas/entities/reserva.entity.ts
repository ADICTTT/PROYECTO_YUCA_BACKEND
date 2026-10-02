import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { EstadoReserva } from '../../../../common/enums/estado-reserva.enum';
import { Participacion } from '../../participaciones/entities/participacion.entity';
import { Stand } from '../../stands/entities/stand.entity';
import { ReservaParticipante } from './reserva-participante.entity';

@Entity('reservas')
@Index('idx_participacion_reserva_activa', ['participacionId'], {
  unique: true,
  where: `"estado" IN ('PENDIENTE_PAGO', 'CONFIRMADA')`,
})
@Index('idx_stand_reserva_activa', ['standId'], {
  unique: true,
  where: `"estado" IN ('PENDIENTE_PAGO', 'CONFIRMADA')`,
})
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'participacion_id' })
  participacionId: number;

  @Column({ name: 'stand_id' })
  standId: number;

  @Column({ name: 'precio_acordado', type: 'decimal', precision: 10, scale: 2 })
  precioAcordado: number;

  @Column({ type: 'enum', enum: EstadoReserva, default: EstadoReserva.PENDIENTE_PAGO })
  estado: EstadoReserva;

  @Column({ name: 'reservado_en', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  reservadoEn: Date;

  @Column({ name: 'vence_en', type: 'timestamp' })
  venceEn: Date;

  @ManyToOne(() => Participacion, (participacion) => participacion.reservas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participacion_id' })
  participacion: Participacion;

  @ManyToOne(() => Stand, (stand) => stand.reservas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stand_id' })
  stand: Stand;

  @OneToMany(() => ReservaParticipante, (rp) => rp.reserva, { cascade: true })
  participantes: ReservaParticipante[];
}