import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CategoriaTipo } from '../../../../common/enums/categoria-tipo.enum';
import { Evento } from './evento.entity';

@Entity('eventos_categorias')
export class EventoCategoria {
  @PrimaryColumn({ name: 'evento_id' })
  eventoId: number;

  @PrimaryColumn({ type: 'enum', enum: CategoriaTipo })
  categoria: CategoriaTipo;

  @ManyToOne(() => Evento, (evento) => evento.categorias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;
}