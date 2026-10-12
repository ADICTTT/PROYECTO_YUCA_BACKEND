// src/modules/stands/stands.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stand } from './entities/stand.entity';
import { CreateStandDto } from './dto/create-stand.dto';
import { UpdateStandDto } from './dto/update-stand.dto';
import { UpdateLayoutDto } from './dto/update-layout.dto';

@Injectable()
export class StandsService {
  constructor(
    @InjectRepository(Stand)
    private readonly standRepository: Repository<Stand>,
  ) {}

  async create(createStandDto: CreateStandDto): Promise<Stand> {
    const stand = this.standRepository.create(createStandDto);
    return await this.standRepository.save(stand);
  }

  async findAll(): Promise<Stand[]> {
    return await this.standRepository.find({ relations: { reservas: true } });
  }

  async findBySector(sectorId: number): Promise<Stand[]> {
    return await this.standRepository.find({
      where: { sectorId },
      relations: { reservas: true },
    });
  }

  async findOne(id: number): Promise<Stand> {
    const stand = await this.standRepository.findOne({
      where: { id },
      relations: { reservas: true },
    });
    if (!stand) {
      throw new NotFoundException(`Stand con ID ${id} no encontrado`);
    }
    return stand;
  }

  async update(id: number, updateStandDto: UpdateStandDto): Promise<Stand> {
    const stand = await this.findOne(id);

    // Regla de protección: Si cambia la categoría, verificar que no tenga reservas activas
    if (updateStandDto.categoria && updateStandDto.categoria !== stand.categoria) {
      const tieneReservaActiva = stand.reservas && stand.reservas.length > 0;
      if (tieneReservaActiva) {
        throw new BadRequestException('No se puede cambiar la categoría de un stand con reserva activa.');
      }
    }

    await this.standRepository.update(id, updateStandDto);
    return await this.findOne(id);
  }

  // PATCH /sectores/:id/layout (Actualización masiva de posiciones/tamaños)
  async updateLayout(sectorId: number, updateLayoutDto: UpdateLayoutDto) {
    for (const item of updateLayoutDto.stands) {
      await this.standRepository.update(item.id, {
        posicionX: item.posicionX,
        posicionY: item.posicionY,
        ancho: item.ancho,
        alto: item.alto,
        rotacion: item.rotacion,
      });
    }
    return { message: 'Layout actualizado correctamente' };
  }

  async remove(id: number) {
    const stand = await this.findOne(id);

    // Regla de protección: No se puede borrar si tiene una reserva activa
    const tieneReservaActiva = stand.reservas && stand.reservas.length > 0;
    if (tieneReservaActiva) {
      throw new BadRequestException('No se puede borrar un stand que tiene una reserva activa.');
    }

    return await this.standRepository.remove(stand);
  }
}