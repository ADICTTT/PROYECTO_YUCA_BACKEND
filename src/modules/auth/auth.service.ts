import { HttpException, Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../admin/users/users.service';

@Injectable()
export class AuthService {

    constructor(private usuarioService: UsersService, 
                private jwtService: JwtService
    ){}

    async login(credenciales: LoginAuthDto){
        const { email, password } = credenciales;
        
        // Busqueda de usuario por nombreUsuario, no tocar para nada
        const usuario = await this.usuarioService.findOneByEmail(email);
        if (!usuario){
            return new HttpException('Usuario no encontrado', 404);
        }

        // Para verificar la contrasenia (asignar la comparación con bcrypt)
        const verificarContra = await bcrypt.compare(password, usuario.password);
        if(!verificarContra){
            throw new HttpException('Contraseña incorrecta', 401)
        }
        
        // Generar JWT
        const payload = {email: email, id: usuario.id};
        const token = await this.jwtService.sign(payload);
        return {access_token: token, user: usuario}
    }

}
