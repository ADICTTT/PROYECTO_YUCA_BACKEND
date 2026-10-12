import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthService } from './auth.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { CambiarCredencialesDto } from '../admin/users/dto/cambiar-credenciales.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/login')
    funInicioSesion(@Body() datos: LoginAuthDto) {
        return this.authService.login(datos);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Get('profile')
    funProfile(@Request() req) {
        return req.user;
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Patch('cambiar-credenciales')
    cambiarCredenciales(@Request() req, @Body() dto: CambiarCredencialesDto) {
    return this.authService.cambiarCredenciales(req.user.id, dto);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Post('restablecer-credenciales/:perfilId')
    restablecerCredenciales(@Request() req, @Param('perfilId', ParseIntPipe) perfilId: number) {
    if (req.user.rol !== 'ADMIN') {
        throw new ForbiddenException('Solo un administrador puede restablecer credenciales');
    }
    return this.authService.restablecerCredenciales(perfilId);
    }
}