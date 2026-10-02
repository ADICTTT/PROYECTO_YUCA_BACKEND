import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Evento } from '../../eventos/entities/evento.entity';
import { Stand } from '../../stands/entities/stand.entity';
import { Sector } from '../../sectores/entities/sectore.entity';

@Entity('pisos')
@Unique(['eventoId', 'orden'])
export class Piso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'evento_id' })
  eventoId: number;

  @Column({ type: 'varchar', length: 80 })
  nombre: string;

  @Column({ type: 'int' })
  orden: number;

  @ManyToOne(() => Evento, (evento) => evento.pisos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @OneToMany(() => Sector, (sector) => sector.piso)
  sectores: Sector[];

  @OneToMany(() => Stand, (stand) => stand.piso)
  stands: Stand[];
}