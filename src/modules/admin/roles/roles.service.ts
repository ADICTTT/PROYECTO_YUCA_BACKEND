import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Rol } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly roleRepository: Repository<Rol>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const nombre = createRoleDto.nombre.trim();
    const existe = await this.roleRepository.findOne({ where: { nombre } });
    if (existe) {
      throw new BadRequestException(`El rol "${nombre}" ya existe`);
    }
    const nuevoRol = this.roleRepository.create({ nombre });
    return await this.roleRepository.save(nuevoRol);
  }

  async findAll() {
    return await this.roleRepository.find();
  }

  async findOne(id: number) {
    const rol = await this.roleRepository.findOneBy({ id });
    if (!rol) {
      throw new NotFoundException(`El rol con ID ${id} no existe`);
    }
    return rol;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const rol = await this.findOne(id);
    if (updateRoleDto.nombre) {
      rol.nombre = updateRoleDto.nombre.trim();
    }
    return await this.roleRepository.save(rol);
  }

  async remove(id: number) {
    const rol = await this.findOne(id);
    return await this.roleRepository.remove(rol);
  }
}