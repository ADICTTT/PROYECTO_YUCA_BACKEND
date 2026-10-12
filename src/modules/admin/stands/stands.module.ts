import { Module } from '@nestjs/common';
import { StandsService } from './stands.service';
import { StandsController } from './stands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stand } from './entities/stand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stand])],
  controllers: [StandsController],
  providers: [StandsService],
})
export class StandsModule {}
