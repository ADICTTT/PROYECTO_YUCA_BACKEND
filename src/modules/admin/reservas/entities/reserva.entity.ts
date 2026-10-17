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

  @Column({ name: 'reservado_en', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  reservadoEn: Date;

  @Column({ name: 'vence_en', type: 'timestamptz' })
  venceEn: Date;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  codigo: string | null;

  @Column({ name: 'pagado_en', type: 'timestamptz', nullable: true })
  pagadoEn: Date | null;

  @Column({ name: 'pagado_por', type: 'uuid', nullable: true })
  pagadoPor?: string | null;

  @Column({ name: 'motivo_liberacion', type: 'varchar', length: 200, nullable: true })
  motivoLiberacion: string | null;

  @ManyToOne(() => Participacion, (participacion) => participacion.reservas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participacion_id' })
  participacion: Participacion;

  @ManyToOne(() => Stand, (stand) => stand.reservas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stand_id' })
  stand: Stand;

  @OneToMany(() => ReservaParticipante, (rp) => rp.reserva, { cascade: true })
  participantes: ReservaParticipante[];
}