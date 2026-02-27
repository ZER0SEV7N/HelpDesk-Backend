import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HardwardService } from './hardward.service';
import { CreateHardwardDto } from './dto/create-hardward.dto';
import { UpdateHardwardDto } from './dto/update-hardward.dto';

@Controller('hardward')
export class HardwardController {
  constructor(private readonly hardwardService: HardwardService) {}

  @Post()
  create(@Body() createHardwardDto: CreateHardwardDto) {
    return this.hardwardService.create(createHardwardDto);
  }

  @Get()
  findAll() {
    return this.hardwardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hardwardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHardwardDto: UpdateHardwardDto) {
    return this.hardwardService.update(+id, updateHardwardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hardwardService.remove(+id);
  }
}
