import { HttpException, Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../admin/users/users.service';
import { CambiarCredencialesDto } from '../admin/users/dto/cambiar-credenciales.dto';

@Injectable()
export class AuthService {

    constructor(private usuarioService: UsersService, 
                private jwtService: JwtService
    ){}

    async login(credenciales: LoginAuthDto) {
        const usuarioIngresado = credenciales.email.trim().toLowerCase();
        const usuario = await this.usuarioService.findOneByEmail(usuarioIngresado);

        if (!usuario.isActive) {
            throw new HttpException('Usuario deshabilitado', 403);
        }

        const verificarContra = await bcrypt.compare(credenciales.password, usuario.password);
        if (!verificarContra) {
            throw new HttpException('Contraseña incorrecta', 401);
        }

        // Si sigue con la contraseña por defecto (usuario + celular), debe cambiarla
        let debeCambiarPassword = false;
        if (usuario.perfil) {
            const celular = (usuario.perfil.celular || '').replace(/\D/g, '');
            debeCambiarPassword = credenciales.password === `${usuario.nombreUsuario}${celular}`;
        }

        const payload = { email: usuario.email, id: usuario.id, rol: usuario.rol?.nombre };
        const token = this.jwtService.sign(payload);

        const { password: _, ...usuarioSinPassword } = usuario;
        return { access_token: token, user: usuarioSinPassword, debeCambiarPassword };
    }

    async cambiarCredenciales(userId: string, dto: CambiarCredencialesDto) {
        return this.usuarioService.cambiarCredenciales(userId, dto);
    }

    async restablecerCredenciales(perfilId: number) {
        return this.usuarioService.restablecerCredenciales(perfilId);
    }

}
