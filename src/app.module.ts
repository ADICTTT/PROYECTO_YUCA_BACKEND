import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
      isGlobal: true,
      envFilePath: ['.development.env', '.production.env']
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // Si existe una URL completa (como la de Neon), la usa directo. Si no, usa los datos sueltos locales.
      url: process.env.DATABASE_URL,
      ...(!process.env.DATABASE_URL && {
        host: process.env.DATABASE_HOST || 'localhost',
        port: +`${process.env.PORT}` || 5436,
        username: process.env.DATABASE_USER || 'postgres', 
        password: process.env.DATABASE_PASSWORD || 'postgresql',
        database: process.env.DATABASE_NAME || 'dbYuca',
      }),
      entities: [
        __dirname + '/../**/*.entity{.ts,.js}'
      ],
      // Solo sincroniza si DB_SYNC=true (únicamente en el .env local)
      synchronize: true,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    }),
    // Límite global: 100 peticiones por minuto por IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    // Permite los @Cron (liberar reservas vencidas)
    ScheduleModule.forRoot(),
    UsersModule, RolesModule, AuthModule, PerfilesModule, EventosModule, PisosModule, SectoresModule, StandsModule, ParticipacionesModule, ReservasModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}