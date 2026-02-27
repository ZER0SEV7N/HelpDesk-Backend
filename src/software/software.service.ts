import { Injectable } from '@nestjs/common';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto';

@Injectable()
export class SoftwareService {
  create(createSoftwareDto: CreateSoftwareDto) {
    return 'This action adds a new software';
  }

  findAll() {
    return `This action returns all software`;
  }

  findOne(id: number) {
    return `This action returns a #${id} software`;
  }

  update(id: number, updateSoftwareDto: UpdateSoftwareDto) {
    return `This action updates a #${id} software`;
  }

  remove(id: number) {
    return `This action removes a #${id} software`;
  }
}
