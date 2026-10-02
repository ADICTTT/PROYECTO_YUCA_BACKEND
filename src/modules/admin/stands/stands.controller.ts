import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StandsService } from './stands.service';
import { CreateStandDto } from './dto/create-stand.dto';
import { UpdateStandDto } from './dto/update-stand.dto';

@Controller('stands')
export class StandsController {
  constructor(private readonly standsService: StandsService) {}

  @Post()
  create(@Body() createStandDto: CreateStandDto) {
    return this.standsService.create(createStandDto);
  }

  @Get()
  findAll() {
    return this.standsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.standsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStandDto: UpdateStandDto) {
    return this.standsService.update(+id, updateStandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.standsService.remove(+id);
  }
}
