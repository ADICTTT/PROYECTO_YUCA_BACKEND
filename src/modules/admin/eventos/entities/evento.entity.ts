import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EstadoEvento } from '../../../../common/enums/estado-evento.enum';
import { EventoCategoria } from './evento-categoria.entity';
import { Piso } from '../../pisos/entities/piso.entity';
import { Participacion } from '../../participaciones/entities/participacion.entity';

@Entity('eventos')
export class Evento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  portada: string;

  @Column({ type: 'varchar', length: 200 })
  ubicacion: string;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin: Date;

  @Column({ name: 'inscripciones_inicio', type: 'timestamp', nullable: true })
  inscripcionesInicio: Date;

  @Column({ name: 'inscripciones_fin', type: 'timestamp', nullable: true })
  inscripcionesFin: Date;

  @Column({ name: 'whatsapp_canal', type: 'varchar', length: 255, nullable: true })
  whatsappCanal: string;

  @Column({ name: 'whatsapp_pagos', type: 'varchar', length: 30, nullable: true })
  whatsappPagos: string;

  @Column({ type: 'enum', enum: EstadoEvento, default: EstadoEvento.BORRADOR })
  estado: EstadoEvento;

  @OneToMany(() => EventoCategoria, (ec) => ec.evento, { cascade: true })
  categorias: EventoCategoria[];

  @OneToMany(() => Piso, (piso) => piso.evento)
  pisos: Piso[];

  @OneToMany(() => Participacion, (participacion) => participacion.evento)
  participaciones: Participacion[];
}