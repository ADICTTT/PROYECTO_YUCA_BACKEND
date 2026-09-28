import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) 
    private userRepository: Repository<User>
  ){

  }

  async create(createUserDto: CreateUserDto) {
    const { email, username } = createUserDto;
    const existeUsername = await this.userRepository.findOne({where: {username: username}});
    if(existeUsername){
      throw new BadRequestException(`El username "${username}" ya está en uso`)
    }
    const existeEmail = await this.userRepository.findOne({where: {email: email}});
    if(existeEmail){
      throw new BadRequestException(`El email "${email}" ya está en uso`)
    }
    const hashPassword = await bcrypt.hash(createUserDto.password, 12);
    const newUser = this.userRepository.create({
      username,
      email,
      password: hashPassword
    });
    this.userRepository.save(newUser);
    const { password, ...resto_datos } = newUser;
    return resto_datos;
  }

  async findAll() {
    const usuarios = await this.userRepository.findBy({ isActive: true });
    return usuarios;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({id: id});
    if(!user){
      throw new NotFoundException(`User con ID ${id} No existe`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if(updateUserDto.password){
      user.password = await bcrypt.hash(updateUserDto.password, 12);
    }
    Object.assign(user, updateUserDto);
    let result = this.userRepository.save(user);
    const {password, ...resto_datos} = user;
    return resto_datos;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);
    return {message: `El usuario ${user.username} ha sido deshabilitado`}
  }

  async findOneByEmail(email: string){
    const user = await this.userRepository.findOneBy({email: email});
    if(!user) throw new NotFoundException(`El usuario con email: ${email} no existe`);
    return user;
  }
}
