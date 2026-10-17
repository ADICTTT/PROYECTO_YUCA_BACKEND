// src/modules/admin/stands/stands.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { StandsService } from './stands.service';
import { CreateStandDto } from './dto/create-stand.dto';
import { UpdateStandDto } from './dto/update-stand.dto';
import { UpdateLayoutDto } from './dto/update-layout.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../common/guards/roles.guard';

// Todo el editor de mesas es solo para ADMIN (el expositor usa /reservas/mapa)
@Controller('stands')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class StandsController {
  constructor(private readonly standsService: StandsService) {}

  @Post()
  create(@Body() createStandDto: CreateStandDto) {
    return this.standsService.create(createStandDto);
  }

  @Get()
  findAll(@Query('sectorId') sectorId?: string) {
    if (sectorId) {
      return this.standsService.findBySector(+sectorId);
    }
    return this.standsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.standsService.findOne(id);
  }

  // PATCH /stands/sectores/:id/layout (Actualización masiva de posiciones, tamaños y rotación)
  @Patch('sectores/:id/layout')
  updateLayout(
    @Param('id', ParseIntPipe) sectorId: number,
    @Body() updateLayoutDto: UpdateLayoutDto,
  ) {
    return this.standsService.updateLayout(sectorId, updateLayoutDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStandDto: UpdateStandDto,
  ) {
    return this.standsService.update(id, updateStandDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.standsService.remove(id);
  }
}