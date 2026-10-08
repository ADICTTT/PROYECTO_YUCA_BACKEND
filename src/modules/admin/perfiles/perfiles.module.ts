import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilesService } from './perfiles.service';
import { PerfilesController } from './perfiles.controller';
import { RedSocial } from './entities/red-social.entity';
import { Perfil } from './entities/perfile.entity';
import { Usuario } from '../users/entities/user.entity';
import { Rol } from '../roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Perfil, RedSocial, Usuario,Rol])],
  controllers: [PerfilesController],
  providers: [PerfilesService],
  exports: [PerfilesService],
})
export class PerfilesModule {}