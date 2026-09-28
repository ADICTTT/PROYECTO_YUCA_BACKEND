import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../admin/users/users.module';
import { jwtConstant } from './constants';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstant.secret,
      signOptions: {expiresIn: '90000s'}
    })
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
