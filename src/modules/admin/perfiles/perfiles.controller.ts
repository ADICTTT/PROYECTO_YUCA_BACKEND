import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // 3. Importa esto
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PerfilesService } from './perfiles.service';
import { UpdateEstadoPerfilDto } from './dto/update-estado-perfil.dto';
import { EstadoPerfil } from '../../../common/enums/estado-perfil.enum';
import { CreatePerfileDto } from './dto/create-perfile.dto';
import { UpdatePerfileDto } from './dto/update-perfile.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../common/guards/roles.guard';

@Controller('perfiles')
export class PerfilesController {
  constructor(private readonly perfilesService: PerfilesService) {}

  // ENDPOINT PÚBLICO: Postulación del expositor
  @Post('publico/registro')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  registrarPerfil(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPerfilDto: CreatePerfileDto,
  ) {
    if (file) {
      createPerfilDto.fotoUrl = `/uploads/${file.filename}`;
    }
    return this.perfilesService.registrarPerfilPublico(createPerfilDto);
  }

  // ENDPOINT ADMIN: Listar perfiles (filtrar por ?estado=EN_REVISION)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(@Query('estado') estado?: EstadoPerfil) {
    return this.perfilesService.findAll(estado);
  }

  @Get('mio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EXPOSITOR')
  findMio(@Req() req: any) {
    return this.perfilesService.findByUsuarioId(req.user.id);
  }

  // ENDPOINT ADMIN: Ver detalle de un perfil
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.perfilesService.findOne(id);
  }

  // --- NUEVO ENDPOINT: Actualizar datos del perfil (nombre, categoría, instagram, etc.) ---
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePerfilDto: UpdatePerfileDto,
  ) {
    return this.perfilesService.update(id, updatePerfilDto);
  }

  // ENDPOINT ADMIN: Actualizar perfil + nueva foto (FormData)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  updateConFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updatePerfilDto: UpdatePerfileDto,
  ) {
    if (file) {
      updatePerfilDto.fotoUrl = `/uploads/${file.filename}`;
    }
    return this.perfilesService.update(id, updatePerfilDto);
  }
  // ENDPOINT ADMIN: Aprobar o Rechazar perfil (Ruta específica)
  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoDto: UpdateEstadoPerfilDto,
  ) {
    return this.perfilesService.cambiarEstado(id, updateEstadoDto);
  }

  
}