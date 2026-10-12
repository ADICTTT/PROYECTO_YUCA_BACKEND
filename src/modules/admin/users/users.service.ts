import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { CambiarCredencialesDto } from '../../admin/users/dto/cambiar-credenciales.dto';


@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(Usuario) 
    private readonly userRepository: Repository<Usuario>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, username, password } = createUserDto;

    // 1. Validar que no exista el nombre de usuario
    const existeUsername = await this.userRepository.findOne({ where: { nombreUsuario: username } });
    if (existeUsername) {
      throw new BadRequestException(`El nombre de usuario "${username}" ya está en uso`);
    }

    // 2. Validar que no exista el correo electrónico
    const existeEmail = await this.userRepository.findOne({ where: { email } });
    if (existeEmail) {
      throw new BadRequestException(`El email "${email}" ya está en uso`);
    }

    // 3. Encriptar la contraseña
    const hashPassword = await bcrypt.hash(password, 12);

    // 4. Crear la instancia asignando los campos correspondientes
    const newUser = this.userRepository.create({
      nombreUsuario: username,
      email,
      password: hashPassword
    });

    // 5. Guardar en la base de datos
    await this.userRepository.save(newUser);

    // 6. Excluir la contraseña del objeto de retorno
    const { password: _, ...restoDatos } = newUser;
    return restoDatos;
  }

  async findAll() {
    return await this.userRepository.findBy({ isActive: true });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no existe`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    // Si viene una nueva contraseña, la encriptamos
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    // Actualizamos las propiedades de forma explícita
    if (updateUserDto.username) {
      user.nombreUsuario = updateUserDto.username;
    }
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }

    await this.userRepository.save(user);

    const { password, ...restoDatos } = user;
    return restoDatos;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);
    return { message: `El usuario "${user.nombreUsuario}" ha sido deshabilitado` };
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: { rol: true, perfil: true },
    });
    if (!user) {
      throw new NotFoundException(`El usuario "${email}" no existe`);
    }
    return user;
  }

  async restablecerCredenciales(perfilId: number) {
    const user = await this.userRepository.findOne({
      where: { perfil: { id: perfilId } },
      relations: { perfil: true, rol: true },
    });
    if (!user) throw new NotFoundException('Este perfil no tiene una cuenta creada');
    if (user.rol?.nombre === 'ADMIN') {
      throw new BadRequestException('No se pueden restablecer credenciales de un administrador');
    }

    const celular = (user.perfil.celular || '').replace(/\D/g, '');
    if (!celular) throw new BadRequestException('El perfil no tiene celular registrado');

    // Misma fórmula que usa el login para detectar la contraseña por defecto
    const nuevaPassword = `${user.nombreUsuario}${celular}`;
    user.password = await bcrypt.hash(nuevaPassword, 12);
    await this.userRepository.save(user);

    return {
      nombre: user.perfil.nombreComercial,
      usuario: user.email,
      password: nuevaPassword,
    };
  }

  async cambiarCredenciales(userId: string, dto: CambiarCredencialesDto) {
    const user = await this.findOne(userId);

    const ok = await bcrypt.compare(dto.passwordActual, user.password);
    if (!ok) throw new UnauthorizedException('La contraseña actual es incorrecta');

    if (dto.nuevaPassword === dto.passwordActual) {
      throw new BadRequestException('La nueva contraseña debe ser distinta a la actual');
    }

    const nuevoUsuario = dto.nuevoNombreUsuario?.trim().toLowerCase();
    if (nuevoUsuario && nuevoUsuario !== user.email) {
      const existe = await this.userRepository.findOne({
        where: [{ email: nuevoUsuario }, { nombreUsuario: nuevoUsuario }],
      });
      if (existe && existe.id !== user.id) {
        throw new ConflictException('Ese usuario ya está en uso');
      }
      user.email = nuevoUsuario;
      user.nombreUsuario = nuevoUsuario;
    }

    user.password = await bcrypt.hash(dto.nuevaPassword, 12);
    await this.userRepository.save(user);

    return { message: 'Credenciales actualizadas. Inicia sesión nuevamente.' };
  }
}