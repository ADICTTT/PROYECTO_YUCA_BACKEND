import { Injectable } from '@nestjs/common';
import { CreateSectoreDto } from './dto/create-sectore.dto';
import { UpdateSectoreDto } from './dto/update-sectore.dto';

@Injectable()
export class SectoresService {
  create(createSectoreDto: CreateSectoreDto) {
    return 'This action adds a new sectore';
  }

  findAll() {
    return `This action returns all sectores`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sectore`;
  }

  update(id: number, updateSectoreDto: UpdateSectoreDto) {
    return `This action updates a #${id} sectore`;
  }

  remove(id: number) {
    return `This action removes a #${id} sectore`;
  }
}
