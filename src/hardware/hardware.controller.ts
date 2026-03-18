import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HardwareService } from './hardware.service';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { UpdateHardwareDto } from './dto/update-hardware.dto';

@Controller('hardware')
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}

  @Post()
  create(@Body() createHardwareDto: CreateHardwareDto) {
    return this.hardwareService.create(createHardwareDto);
  }

  @Get()
  findAll() {
    return this.hardwareService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hardwareService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHardwareDto: UpdateHardwareDto) {
    return this.hardwareService.update(+id, updateHardwareDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hardwareService.remove(+id);
  }
}
