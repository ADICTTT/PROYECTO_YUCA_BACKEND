import { CategoriaTipo } from '../../../../common/enums/categoria-tipo.enum';
import { EstadoPerfil } from '../../../../common/enums/estado-perfil.enum';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { RedSocial } from './red-social.entity';
import { Participacion } from '../../participaciones/entities/participacion.entity';
import { ReservaParticipante } from '../../reservas/entities/reserva-participante.entity';
import { Usuario } from '../../users/entities/user.entity';

@Entity('perfiles')
export class Perfil {
  @PrimaryGeneratedColumn()
  id: number; 

  @Column({ name: 'nombre_real', type: 'varchar', length: 120 })
  nombreReal: string;

  @Column({ type: 'varchar', length: 20 })
  celular: string;

  @Column({ name: 'nombre_comercial', type: 'varchar', length: 120 })
  nombreComercial: string;

  @Column({ type: 'enum', enum: CategoriaTipo })
  categoria: CategoriaTipo;

  @Column({ type: 'varchar', length: 150 })
  instagram: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'portafolio_url', type: 'varchar', length: 255, nullable: true })
  portafolioUrl?: string;

  @Column({ type: 'enum', enum: EstadoPerfil, default: EstadoPerfil.EN_REVISION })
  estado: EstadoPerfil;

  // Clave foránea opcional al crear el perfil sin usuario explícito
  @Column({ name: 'usuario_id', type: 'uuid', nullable: true, unique: true })
  usuarioId?: string;

  @OneToOne(() => Usuario, (usuario) => usuario.perfil, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  @OneToMany(() => RedSocial, (red) => red.perfil, { cascade: true })
  redesSociales?: RedSocial[];

  @OneToMany(() => Participacion, (participacion) => participacion.perfil)
  participaciones?: Participacion[];

  @OneToMany(() => ReservaParticipante, (rp) => rp.perfil)
  reservasParticipadas?: ReservaParticipante[];
}