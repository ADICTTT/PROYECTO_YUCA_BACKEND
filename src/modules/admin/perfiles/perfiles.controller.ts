import {
  BadRequestException,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { PerfilesService } from './perfiles.service';
import { UpdateEstadoPerfilDto } from './dto/update-estado-perfil.dto';
import { EstadoPerfil } from '../../../common/enums/estado-perfil.enum';
import { CreatePerfileDto } from './dto/create-perfile.dto';
import { UpdatePerfileDto } from './dto/update-perfile.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../common/guards/roles.guard';

// Configurar Cloudinary con las variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Definir el almacenamiento en la nube
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'proyecto-yuca-perfiles',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  } as any,
});

// Opciones de subida: límite de 5 MB y solo JPG/PNG
const uploadOptions = {
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    const ok = ['image/jpeg', 'image/png'].includes(file.mimetype);
    cb(ok ? null : new BadRequestException('Solo se permiten imágenes JPG o PNG'), ok);
  },
};

@Controller('perfiles')
export class PerfilesController {
  constructor(private readonly perfilesService: PerfilesService) {}

  // ENDPOINT PÚBLICO: Postulación del expositor
  @Post('publico/registro')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  registrarPerfil(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPerfilDto: CreatePerfileDto,
  ) {
    if (file) {
      // file.path contiene la URL completa y permanente de Cloudinary
      createPerfilDto.fotoUrl = file.path;
    }
    return this.perfilesService.registrarPerfilPublico(createPerfilDto);
  }

  // ENDPOINT PÚBLICO: estado del perfil por celular (máx. 5 por minuto)
  // Debe ir ANTES de cualquier @Get(':id')
  @Get('estado')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  estadoPublico(@Query('celular') celular: string) {
    return this.perfilesService.estadoPorCelular(celular);
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

  // ENDPOINT EXPOSITOR: cambiar la foto de su propio perfil (máx. 10 por minuto)
  @Patch('mio/foto')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EXPOSITOR')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  cambiarMiFoto(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Selecciona una imagen JPG o PNG');
    }
    return this.perfilesService.actualizarFotoMia(req.user.id, file.path);
  }

  // ENDPOINT ADMIN: Ver detalle de un perfil
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.perfilesService.findOne(id);
  }

  // Actualizar datos del perfil
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePerfilDto: UpdatePerfileDto,
  ) {
    return this.perfilesService.update(id, updatePerfilDto);
  }

  // ENDPOINT ADMIN: Actualizar perfil + nueva foto
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  updateConFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updatePerfilDto: UpdatePerfileDto,
  ) {
    if (file) {
      updatePerfilDto.fotoUrl = file.path;
    }
    return this.perfilesService.update(id, updatePerfilDto);
  }

  // ENDPOINT ADMIN: Aprobar o Rechazar perfil
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