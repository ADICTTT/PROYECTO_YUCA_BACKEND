import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { TipoParticipante } from '../../../../common/enums/tipo-participante.enum';
import { Reserva } from './reserva.entity';
import { Perfil } from '../../perfiles/entities/perfile.entity';

@Entity('reserva_participantes')
@Unique(['reservaId', 'perfilId'])
export class ReservaParticipante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reserva_id' }) 
  reservaId: number;

  @Column({ name: 'perfil_id' })
  perfilId: number;

  @Column({ type: 'enum', enum: TipoParticipante })
  tipo: TipoParticipante;

  @ManyToOne(() => Reserva, (reserva) => reserva.participantes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reserva_id' })
  reserva: Reserva;

  @ManyToOne(() => Perfil, (perfil) => perfil.reservasParticipadas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'perfil_id' })
  perfil: Perfil;
}