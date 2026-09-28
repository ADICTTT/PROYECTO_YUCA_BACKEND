import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthService } from './auth.service';
//import { AuthGuard } from './auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){

    }

    @Post('/login')
    funInicioSesion(@Body() datos: LoginAuthDto){
        return this.authService.login(datos)
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Get('profile')
    funProfile(@Request() req){
        return req.user;
    }

}
