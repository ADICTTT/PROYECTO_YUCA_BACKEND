import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateEstadoPerfilDto } from './dto/update-estado-perfil.dto';
import { EstadoPerfil } from '../../../common/enums/estado-perfil.enum';
import { Perfil } from './entities/perfile.entity';
import { CreatePerfileDto } from './dto/create-perfile.dto';
import { UpdatePerfileDto } from './dto/update-perfile.dto';

@Injectable()
export class PerfilesService {
  constructor(
    @InjectRepository(Perfil)
    private readonly perfilRepository: Repository<Perfil>,
  ) {}

  // 1. Registro público (Expositor)
  async registrarPerfilPublico(createPerfilDto: CreatePerfileDto): Promise<Perfil> {
    const nuevoPerfil = this.perfilRepository.create({
      ...createPerfilDto,
      estado: EstadoPerfil.EN_REVISION,
    });

    return await this.perfilRepository.save(nuevoPerfil);
  }

  // 2. Obtener todos los perfiles con filtros (Admin)
  async findAll(estado?: EstadoPerfil): Promise<Perfil[]> {
    const query = this.perfilRepository.createQueryBuilder('perfil')
      .leftJoinAndSelect('perfil.redesSociales', 'redesSociales');

    if (estado) {
      query.where('perfil.estado = :estado', { estado });
    }

    return await query.orderBy('perfil.id', 'DESC').getMany();
  }

  // 3. Obtener un perfil por ID
  // En perfiles.service.ts
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

  // 4. Cambiar estado (Aprobar / Rechazar) desde el panel Admin
  async cambiarEstado(id: number, updateEstadoDto: UpdateEstadoPerfilDto): Promise<Perfil> {
    const perfil = await this.findOne(id);
    perfil.estado = updateEstadoDto.estado;
    return await this.perfilRepository.save(perfil);
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
}