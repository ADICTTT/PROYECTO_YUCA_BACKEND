import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PisosService } from './pisos.service';
import { CreatePisoDto } from './dto/create-piso.dto';
import { UpdatePisoDto } from './dto/update-piso.dto';

@Controller('pisos')
export class PisosController {
  constructor(private readonly pisosService: PisosService) {}

  @Post()
  create(@Body() createPisoDto: CreatePisoDto) {
    return this.pisosService.create(createPisoDto);
  }

  @Get()
  findAll() {
    return this.pisosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pisosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePisoDto: UpdatePisoDto) {
    return this.pisosService.update(+id, updatePisoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pisosService.remove(+id);
  }
}
