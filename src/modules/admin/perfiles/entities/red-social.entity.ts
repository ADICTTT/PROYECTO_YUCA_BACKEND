import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Perfil } from './perfile.entity';

@Entity('redes_sociales')
export class RedSocial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'perfil_id' })
  perfilId: number;

  @Column({ type: 'varchar', length: 50 })
  plataforma: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @ManyToOne(() => Perfil, (perfil) => perfil.redesSociales, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'perfil_id' })
  perfil: Perfil;
}