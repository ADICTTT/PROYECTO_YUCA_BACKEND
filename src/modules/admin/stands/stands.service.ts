import { Injectable } from '@nestjs/common';
import { CreateStandDto } from './dto/create-stand.dto';
import { UpdateStandDto } from './dto/update-stand.dto';

@Injectable()
export class StandsService {
  create(createStandDto: CreateStandDto) {
    return 'This action adds a new stand';
  }

  findAll() {
    return `This action returns all stands`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stand`;
  }

  update(id: number, updateStandDto: UpdateStandDto) {
    return `This action updates a #${id} stand`;
  }

  remove(id: number) {
    return `This action removes a #${id} stand`;
  }
}
