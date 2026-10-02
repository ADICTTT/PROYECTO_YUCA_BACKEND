import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './entities/user.entity';

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
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(`El usuario con email "${email}" no existe`);
    }
    return user;
  }
}