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
import { FileInterceptor } from '@nestjs/platform-express';
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

@Controller('perfiles')
export class PerfilesController {
  constructor(private readonly perfilesService: PerfilesService) {}

  // ENDPOINT PÚBLICO: Postulación del expositor
  @Post('publico/registro')
  @UseInterceptors(FileInterceptor('file', { storage: cloudinaryStorage }))
  registrarPerfil(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPerfilDto: CreatePerfileDto,
  ) {
    if (file) {
      // file.path contiene la URL completa y permanente de Cloudinary (https://res.cloudinary.com/...)
      createPerfilDto.fotoUrl = file.path;
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
  @UseInterceptors(FileInterceptor('file', { storage: cloudinaryStorage }))
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