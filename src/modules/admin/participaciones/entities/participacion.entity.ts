import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Evento } from '../../eventos/entities/evento.entity';
import { Reserva } from '../../reservas/entities/reserva.entity';
import { EstadoParticipacion } from '../../../../common/enums/estado-participacion.enum';
import { Perfil } from '../../perfiles/entities/perfile.entity';

@Entity('participaciones')
@Unique(['perfilId', 'eventoId'])
export class Participacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'perfil_id' })
  perfilId: number;

  @Column({ name: 'evento_id' })
  eventoId: number;

  @Column({ type: 'enum', enum: EstadoParticipacion, default: EstadoParticipacion.PENDIENTE })
  estado: EstadoParticipacion;

  @Column({ name: 'permite_companero', type: 'boolean', default: false })
  permiteCompanero: boolean;

  @ManyToOne(() => Perfil, (perfil) => perfil.participaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'perfil_id' })
  perfil: Perfil;

  @ManyToOne(() => Evento, (evento) => evento.participaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @OneToMany(() => Reserva, (reserva) => reserva.participacion)
  reservas: Reserva[];
}