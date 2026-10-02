import { Injectable } from '@nestjs/common';
import { CreatePisoDto } from './dto/create-piso.dto';
import { UpdatePisoDto } from './dto/update-piso.dto';

@Injectable()
export class PisosService {
  create(createPisoDto: CreatePisoDto) {
    return 'This action adds a new piso';
  }

  findAll() {
    return `This action returns all pisos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} piso`;
  }

  update(id: number, updatePisoDto: UpdatePisoDto) {
    return `This action updates a #${id} piso`;
  }

  remove(id: number) {
    return `This action removes a #${id} piso`;
  }
}
