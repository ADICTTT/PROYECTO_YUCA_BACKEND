import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { EstadoStand } from '../../../../common/enums/estado-stand.enum';
import { CategoriaTipo } from '../../../../common/enums/categoria-tipo.enum';
import { Piso } from '../../pisos/entities/piso.entity';
import { Reserva } from '../../reservas/entities/reserva.entity';
import { Sector } from '../../sectores/entities/sectore.entity';

@Entity('stands')
@Unique(['pisoId', 'codigo'])
export class Stand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'piso_id' })
  pisoId: number;

  @Column({ name: 'sector_id', nullable: true })
  sectorId: number;

  @Column({ type: 'varchar', length: 30 })
  codigo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ name: 'posicion_x', type: 'decimal', precision: 10, scale: 2, default: 0 })
  posicionX: number;

  @Column({ name: 'posicion_y', type: 'decimal', precision: 10, scale: 2, default: 0 })
  posicionY: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  ancho: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  alto: number;

  @Column({ type: 'int', default: 0 })
  rotacion: number;

  @Column({ type: 'enum', enum: EstadoStand, default: EstadoStand.DISPONIBLE })
  estado: EstadoStand;

  @ManyToOne(() => Piso, (piso) => piso.stands, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'piso_id' })
  piso: Piso;

  @Column({
    type: 'enum',
    enum: CategoriaTipo,
    default: CategoriaTipo.ILUSTRADORES
  })
  categoria: CategoriaTipo;

  @ManyToOne(() => Sector, (sector) => sector.stands, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sector_id' })
  sector: Sector;

  @OneToMany(() => Reserva, (reserva) => reserva.stand)
  reservas: Reserva[];

  // ───────── Datos de la mesa (se muestran al expositor) ─────────

  @Column({ type: 'varchar', length: 60, nullable: true })
  medidas: string | null;

  @Column({ type: 'int', nullable: true })
  sillas: number | null;

  @Column({ name: 'incluye_merienda', type: 'boolean', default: false })
  incluyeMerienda: boolean;

  @Column({ name: 'bajo_techo', type: 'boolean', default: false })
  bajoTecho: boolean;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;
}