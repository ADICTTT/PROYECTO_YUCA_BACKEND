import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthService } from './auth.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CambiarCredencialesDto } from '../admin/users/dto/cambiar-credenciales.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    // Máximo 10 intentos de login por minuto por IP
    @Post('/login')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    funInicioSesion(@Body() datos: LoginAuthDto) {
        return this.authService.login(datos);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    funProfile(@Request() req) {
        return req.user;
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch('cambiar-credenciales')
    cambiarCredenciales(@Request() req, @Body() dto: CambiarCredencialesDto) {
        return this.authService.cambiarCredenciales(req.user.id, dto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('restablecer-credenciales/:perfilId')
    restablecerCredenciales(@Request() req, @Param('perfilId', ParseIntPipe) perfilId: number) {
        if (req.user.rol !== 'ADMIN') {
            throw new ForbiddenException('Solo un administrador puede restablecer credenciales');
        }
        return this.authService.restablecerCredenciales(perfilId);
    }
}