import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './modules/admin/roles/roles.module';
import { UsersModule } from './modules/admin/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PerfilesModule } from './modules/admin/perfiles/perfiles.module';
import { EventosModule } from './modules/admin/eventos/eventos.module';
import { PisosModule } from './modules/admin/pisos/pisos.module';
import { SectoresModule } from './modules/admin/sectores/sectores.module';
import { StandsModule } from './modules/admin/stands/stands.module';
import { ParticipacionesModule } from './modules/admin/participaciones/participaciones.module';
import { ReservasModule } from './modules/admin/reservas/reservas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.development.env', '.production.env']
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: +`${process.env.PORT}` || 5436,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgresql',
      database: process.env.DATABASE_NAME || 'bd_yuca_backend',
      entities: [
        __dirname + '/../**/*.entity{.ts,.js}'
      ],
      synchronize: false
    }), 
    UsersModule, RolesModule, AuthModule, PerfilesModule, EventosModule, PisosModule, SectoresModule, StandsModule, ParticipacionesModule, ReservasModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
