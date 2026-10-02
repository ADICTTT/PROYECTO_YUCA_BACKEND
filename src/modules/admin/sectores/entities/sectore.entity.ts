import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Piso } from '../../pisos/entities/piso.entity';
import { Stand } from '../../stands/entities/stand.entity';

@Entity('sectores')
export class Sector {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'piso_id' })
  pisoId: number;

  @Column({ type: 'varchar', length: 80 })
  nombre: string;

  @ManyToOne(() => Piso, (piso) => piso.sectores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'piso_id' })
  piso: Piso;

  @OneToMany(() => Stand, (stand) => stand.sector)
  stands: Stand[];
}