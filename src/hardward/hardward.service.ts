import { Injectable } from '@nestjs/common';
import { CreateHardwardDto } from './dto/create-hardward.dto';
import { UpdateHardwardDto } from './dto/update-hardward.dto';

@Injectable()
export class HardwardService {
  create(createHardwardDto: CreateHardwardDto) {
    return 'This action adds a new hardward';
  }

  findAll() {
    return `This action returns all hardward`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hardward`;
  }

  update(id: number, updateHardwardDto: UpdateHardwardDto) {
    return `This action updates a #${id} hardward`;
  }

  remove(id: number) {
    return `This action removes a #${id} hardward`;
  }
}
