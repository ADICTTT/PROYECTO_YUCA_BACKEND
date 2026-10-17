import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateEstadoPerfilDto } from './dto/update-estado-perfil.dto';
import { EstadoPerfil } from '../../../common/enums/estado-perfil.enum';
import { Perfil } from './entities/perfile.entity';
import { CreatePerfileDto } from './dto/create-perfile.dto';
import { UpdatePerfileDto } from './dto/update-perfile.dto';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../users/entities/user.entity';
import { Rol } from '../roles/entities/role.entity';

@Injectable()
export class PerfilesService {
  constructor(
    @InjectRepository(Perfil)
    private readonly perfilRepository: Repository<Perfil>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  // 1. Registro público (Expositor)
  async registrarPerfilPublico(createPerfilDto: CreatePerfileDto): Promise<Perfil> {
    const nuevoPerfil = this.perfilRepository.create({
      ...createPerfilDto,
      estado: EstadoPerfil.EN_REVISION,
    });

    return await this.perfilRepository.save(nuevoPerfil);
  }

  // 1b. Consulta pública del estado por celular (sin login).
  // Compara los últimos 8 dígitos y devuelve SOLO el estado, nunca datos del perfil.
  async estadoPorCelular(celular: string): Promise<{ estado: string }> {
    const digitos = (celular || '').replace(/\D/g, '');
    if (digitos.length < 8) return { estado: 'SIN_PERFIL' };
    const ultimos = digitos.slice(-8);

    const perfil = await this.perfilRepository
      .createQueryBuilder('perfil')
      .where(`RIGHT(regexp_replace(perfil.celular, '\\D', '', 'g'), 8) = :ultimos`, { ultimos })
      .orderBy('perfil.id', 'DESC')
      .getOne();

    return { estado: perfil ? perfil.estado : 'SIN_PERFIL' };
  }

  // 2. Obtener todos los perfiles con filtros (Admin)
  async findAll(estado?: EstadoPerfil): Promise<Perfil[]> {
    const query = this.perfilRepository
      .createQueryBuilder('perfil')
      .leftJoinAndSelect('perfil.redesSociales', 'redesSociales');

    if (estado) {
      query.where('perfil.estado = :estado', { estado });
    }

    return await query.orderBy('perfil.id', 'DESC').getMany();
  }

  // 3. Obtener un perfil por ID
  async findOne(id: number): Promise<Perfil> {
    const perfil = await this.perfilRepository.findOne({
      where: { id },
      relations: {
        redesSociales: true,
        usuario: true,
      },
    });

    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }

    return perfil;
  }

  async cambiarEstado(id: number, updateEstadoDto: UpdateEstadoPerfilDto) {
    const perfil = await this.findOne(id);
    perfil.estado = updateEstadoDto.estado;

    // Al aprobar, se crea la cuenta solo si el perfil aún no tiene una
    let credenciales: { usuario: string; password: string } | null = null;
    if (
      updateEstadoDto.estado === EstadoPerfil.APROBADO &&
      !perfil.usuarioId &&
      !perfil.usuario
    ) {
      credenciales = await this.crearCuentaExpositor(perfil);
    }

    await this.perfilRepository.save(perfil);
    return { ...perfil, credenciales };
  }

  private normalizarUsuario(instagram: string): string {
    return (instagram || '')
      .trim()
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/[^a-z0-9._-]/g, '')
      .slice(0, 90);
  }

  private async crearCuentaExpositor(perfil: Perfil) {
    const celular = (perfil.celular || '').replace(/\D/g, '');
    const base = this.normalizarUsuario(perfil.instagram) || `expositor${perfil.id}`;

    // Usuario único: si ya existe, se agrega un número
    let usuario = base;
    let n = 1;
    while (
      (await this.usuarioRepository.count({
        where: [{ nombreUsuario: usuario }, { email: usuario }],
      })) > 0
    ) {
      usuario = `${base}${n++}`;
    }

    // Contraseña por defecto: usuario + celular
    const password = `${usuario}${celular}`;

    // Rol: se busca; si no existe, se crea la fila (no cambia la estructura)
    let rol = await this.rolRepository.findOne({ where: { nombre: 'EXPOSITOR' } });
    if (!rol) {
      rol = await this.rolRepository.save(this.rolRepository.create({ nombre: 'EXPOSITOR' }));
    }

    const nuevo = await this.usuarioRepository.save(
      this.usuarioRepository.create({
        nombreUsuario: usuario,
        email: usuario, // la columna email funciona como "usuario" de login
        password: await bcrypt.hash(password, 12),
        rolId: rol.id,
      }),
    );

    perfil.usuario = nuevo;
    perfil.usuarioId = nuevo.id;

    return { usuario, password };
  }

  async update(id: number, updatePerfilDto: UpdatePerfileDto) {
    const perfil = await this.perfilRepository.preload({
      id,
      ...updatePerfilDto,
    });

    if (!perfil) {
      throw new NotFoundException(`El perfil con ID ${id} no existe`);
    }

    await this.perfilRepository.save(perfil);

    // Retorna el perfil con sus relaciones actualizadas
    return this.findOne(id);
  }

  async findByUsuarioId(usuarioId: string) {
    const perfil = await this.perfilRepository.findOne({ where: { usuarioId } });
    if (!perfil) throw new NotFoundException('Perfil no encontrado');
    return perfil;
  }
}