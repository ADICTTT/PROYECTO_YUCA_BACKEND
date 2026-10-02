import { Injectable } from '@nestjs/common';
import { CreateParticipacioneDto } from './dto/create-participacione.dto';
import { UpdateParticipacioneDto } from './dto/update-participacione.dto';

@Injectable()
export class ParticipacionesService {
  create(createParticipacioneDto: CreateParticipacioneDto) {
    return 'This action adds a new participacione';
  }

  findAll() {
    return `This action returns all participaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} participacione`;
  }

  update(id: number, updateParticipacioneDto: UpdateParticipacioneDto) {
    return `This action updates a #${id} participacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} participacione`;
  }
}
