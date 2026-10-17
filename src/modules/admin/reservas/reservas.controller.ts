import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { CreateReservaManualDto } from './dto/create-reserva-manual.dto';
import { FiltrarReservasDto } from './dto/filtrar-reservas.dto';
import { LiberarReservaDto } from './dto/liberar-reserva.dto';
import { ExtenderReservaDto } from './dto/extender-reserva.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../common/guards/roles.guard';

// Por defecto solo ADMIN; cada ruta de expositor lo sobrescribe
@Controller('reservas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  // ───────────── EXPOSITOR ─────────────

  @Get('mapa')
  @Roles('EXPOSITOR', 'ADMIN')
  mapa(@Req() req: any) {
    return this.reservasService.mapa(req.user);
  }

  @Get('reglas')
  @Roles('EXPOSITOR')
  reglas(@Req() req: any) {
    return this.reservasService.reglas(req.user.id);
  }

  @Post('aceptar-reglas')
  @Roles('EXPOSITOR')
  aceptarReglas(@Req() req: any) {
    return this.reservasService.aceptarReglas(req.user.id);
  }

  // Buscador de compañero: límite más estricto (30 por minuto)
  @Get('companeros')
  @Roles('EXPOSITOR')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  companeros(@Req() req: any, @Query('q') q: string) {
    return this.reservasService.buscarCompaneros(req.user.id, q);
  }

  @Get('mia')
  @Roles('EXPOSITOR')
  mia(@Req() req: any) {
    return this.reservasService.miReserva(req.user.id);
  }

  @Post()
  @Roles('EXPOSITOR')
  create(@Req() req: any, @Body() dto: CreateReservaDto) {
    // El perfil sale del token, nunca del body
    return this.reservasService.create(req.user.id, dto);
  }

  // ───────────── ADMIN ─────────────

  @Get()
  listar(@Query() filtros: FiltrarReservasDto) {
    return this.reservasService.listar({ estado: filtros.estado, q: filtros.q });
  }

  @Post('manual')
  crearManual(@Req() req: any, @Body() dto: CreateReservaManualDto) {
    return this.reservasService.crearManual(dto, req.user.id);
  }

  @Patch(':id/pagar')
  pagar(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.reservasService.marcarPagada(id, req.user.id);
  }

  @Patch(':id/liberar')
  liberar(@Param('id', ParseIntPipe) id: number, @Body() dto: LiberarReservaDto) {
    return this.reservasService.liberar(id, dto.motivo);
  }

  @Patch(':id/extender')
  extender(@Param('id', ParseIntPipe) id: number, @Body() dto: ExtenderReservaDto) {
    return this.reservasService.extenderPlazo(id, dto.horas);
  }
}