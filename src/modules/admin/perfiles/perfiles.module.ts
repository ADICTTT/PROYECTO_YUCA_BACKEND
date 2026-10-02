import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilesService } from './perfiles.service';
import { PerfilesController } from './perfiles.controller';
import { RedSocial } from './entities/red-social.entity';
import { Perfil } from './entities/perfile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Perfil, RedSocial])],
  controllers: [PerfilesController],
  providers: [PerfilesService],
  exports: [PerfilesService],
})
export class PerfilesModule {}