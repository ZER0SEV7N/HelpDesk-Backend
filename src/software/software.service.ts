import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto';
import { Software } from './entities/software.entity';

@Injectable()
export class SoftwareService {
  constructor(
    @InjectRepository(Software)
    private readonly softwareRepository: Repository<Software>,
  ) {}

  async create(createSoftwareDto: CreateSoftwareDto) {
    const software = this.softwareRepository.create(createSoftwareDto as Partial<Software>);
    return this.softwareRepository.save(software);
  }

  async findAll() {
    return this.softwareRepository.find();
  }

  async findOne(id: number) {
    const software = await this.softwareRepository.findOneBy({ id_software: id });

    if (!software) {
      throw new NotFoundException(`Software con id ${id} no encontrado`);
    }

    return software;
  }

  async update(id: number, updateSoftwareDto: UpdateSoftwareDto) {
    const software = await this.softwareRepository.preload({
      id_software: id,
      ...(updateSoftwareDto as Partial<Software>),
    });

    if (!software) {
      throw new NotFoundException(`Software con id ${id} no encontrado`);
    }

    return this.softwareRepository.save(software);
  }

  async remove(id: number) {
    const software = await this.findOne(id);
    await this.softwareRepository.remove(software);

    return {
      message: `Software con id ${id} eliminado correctamente`,
    };
  }
}
