import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PerfilesService } from './perfiles.service';
import { UpdateEstadoPerfilDto } from './dto/update-estado-perfil.dto';
import { EstadoPerfil } from '../../../common/enums/estado-perfil.enum';
import { CreatePerfileDto } from './dto/create-perfile.dto';
import { UpdatePerfileDto } from './dto/update-perfile.dto';

@Controller('perfiles')
export class PerfilesController {
  constructor(private readonly perfilesService: PerfilesService) {}

  // ENDPOINT PÚBLICO: Postulación del expositor
  @Post('publico/registro')
  registrarPerfil(@Body() createPerfilDto: CreatePerfileDto) {
    return this.perfilesService.registrarPerfilPublico(createPerfilDto);
  }

  // ENDPOINT ADMIN: Listar perfiles (filtrar por ?estado=EN_REVISION)
  @Get()
  findAll(@Query('estado') estado?: EstadoPerfil) {
    return this.perfilesService.findAll(estado);
  }

  // ENDPOINT ADMIN: Ver detalle de un perfil
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.perfilesService.findOne(id);
  }

  // --- NUEVO ENDPOINT: Actualizar datos del perfil (nombre, categoría, instagram, etc.) ---
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePerfilDto: UpdatePerfileDto,
  ) {
    return this.perfilesService.update(id, updatePerfilDto);
  }

  // ENDPOINT ADMIN: Aprobar o Rechazar perfil (Ruta específica)
  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoDto: UpdateEstadoPerfilDto,
  ) {
    return this.perfilesService.cambiarEstado(id, updateEstadoDto);
  }
}