import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SectoresService } from './sectores.service';
import { CreateSectoreDto } from './dto/create-sectore.dto';
import { UpdateSectoreDto } from './dto/update-sectore.dto';

@Controller('sectores')
export class SectoresController {
  constructor(private readonly sectoresService: SectoresService) {}

  @Post()
  create(@Body() createSectoreDto: CreateSectoreDto) {
    return this.sectoresService.create(createSectoreDto);
  }

  @Get()
  findAll() {
    return this.sectoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectoresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectoreDto: UpdateSectoreDto) {
    return this.sectoresService.update(+id, updateSectoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectoresService.remove(+id);
  }
}
