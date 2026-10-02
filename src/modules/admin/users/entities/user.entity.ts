import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Perfil } from '../../perfiles/entities/perfile.entity';
import { Rol } from '../../roles/entities/role.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, length: 100 })
  nombreUsuario: string;

  @Column({ type: 'varchar', unique: true, length: 150 })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'rolId', type: 'int', nullable: true })
  rolId: number;

  @ManyToOne(() => Rol, (role) => role.usuarios, { nullable: true })
  @JoinColumn({ name: 'rolId' })
  rol: Rol;

  @OneToOne(() => Perfil, (perfil) => perfil.usuario)
  perfil: Perfil;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}