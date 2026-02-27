import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SoftwareService } from './software.service';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto';

@Controller('software')
export class SoftwareController {
  constructor(private readonly softwareService: SoftwareService) {}

  @Post()
  create(@Body() createSoftwareDto: CreateSoftwareDto) {
    return this.softwareService.create(createSoftwareDto);
  }

  @Get()
  findAll() {
    return this.softwareService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.softwareService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSoftwareDto: UpdateSoftwareDto) {
    return this.softwareService.update(+id, updateSoftwareDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.softwareService.remove(+id);
  }
}
