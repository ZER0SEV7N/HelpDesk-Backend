//src/hardware/hardware.controller.ts
//Controlador para la gestion de hardware
//Importaciones necesarias:
import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    Query 
} from '@nestjs/common';
import { HardwareService } from './hardware.service';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { UpdateHardwareDto } from './dto/update-hardware.dto';

//Definicion del controlador HardwareController
@Controller('hardware')
export class HardwareController {
    constructor(private readonly hardwareService: HardwareService) {}

    //API: POST localhost:3000/hardware
    //Crear un nuevo hardware
    @Post()
    create(@Body() createHardwareDto: CreateHardwareDto) {
        return this.hardwareService.create(createHardwareDto);
    }

    //API: GET localhost:3000/hardware
    //Listar todos los hardwares
    @Get()
    findAll(@Query('tipo') tipo?: string, @Query('marca') marca?: string) {
        if (tipo) {
            return this.hardwareService.findByTipo(tipo);
        }
        if (marca) {
            return this.hardwareService.findByMarca(marca);
        }
        return this.hardwareService.findAll();
    }

    //API: GET localhost:3000/hardware/:id
    //Buscar un hardware por ID
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.hardwareService.findOne(+id);
    }

    //API: PATCH localhost:3000/hardware/:id
    //Actualizar un hardware
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateHardwareDto: UpdateHardwareDto) {
        return this.hardwareService.update(+id, updateHardwareDto);
    }

    //API: DELETE localhost:3000/hardware/:id
    //Eliminar un hardware
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.hardwareService.remove(+id);
    }
}
