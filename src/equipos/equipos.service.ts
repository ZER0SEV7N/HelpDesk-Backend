//src/equipos/equipos.service.ts
//Modulo para manejar la logica de negocio relacionada con los equipos
//-----Funcionalidades
// - Crear un nuevo equipo
// - Obtener la lista de equipos
// - Obtener un equipo por su ID
// - Actualizar un equipo existente
// - Eliminar un equipo
//Importaciones necesarias

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
//ENTIDADES necesarias
import { Equipos } from '../entities/Equipos.entity';
import { Empresa } from 'src/entities/Empresa.entity';
import { MicroEmpresa } from '../entities/MicroEmpresa.entity';
import { Planes } from 'src/entities/Planes.entity';
//DTO necesarios
import { CreateEquipoDTO } from './dto/create-equipos.dto';
import { UpdateEquipoDto } from './dto/update-equipos.dto';
import { PersonaNatural } from 'src/entities/Persona_natural.entity';

//Decorador para marcar la clase como un servicio con codigo inyectable
@Injectable()
export class EquiposService {
  //Constructor para los repositorios de las entidades
  constructor(
    //Repo Equipos
    @InjectRepository(Equipos)
    private equiposRepo: Repository<Equipos>,
    //Repo Empresa
    @InjectRepository(Empresa)
    private empresaRepo: Repository<Empresa>,
    //Repo MicroEmpresa
    @InjectRepository(MicroEmpresa)
    private microEmpresaRepo: Repository<MicroEmpresa>,
    //Repo Planes
    @InjectRepository(Planes)
    private planesRepo: Repository<Planes>,
    //Repo PersonaNatural
    @InjectRepository(PersonaNatural)
    private personaNaturalRepo: Repository<PersonaNatural>,
  ) {}

  //Metodo para crear un nuevo equipo en la base de datos
  //Recibe un DTO con los datos del nuevo equipo
  //POST /equipos
  async create(createEquipoDTO: CreateEquipoDTO): Promise<Equipos> {
    //Validar el propietario del equipo
    const propetrarios = [
      createEquipoDTO.id_empresa,
      createEquipoDTO.id_microempresa,
      createEquipoDTO.id_personanatural,
    ].filter(Boolean);

    //Verificar que solo haya un propietario
    if (propetrarios.length > 1) {
      throw new BadRequestException(
        'El equipo debe tener exactamente un propietario',
      );
    }

    //Buscar relaciones si existen
    const empresa = createEquipoDTO.id_empresa
      ? await this.empresaRepo.findOneBy({
          id_empresa: createEquipoDTO.id_empresa,
        })
      : null;
    const microEmpresa = createEquipoDTO.id_microempresa
      ? await this.microEmpresaRepo.findOneBy({
          id_microempresa: createEquipoDTO.id_microempresa,
        })
      : null;
    const personaNatural = createEquipoDTO.id_personanatural
      ? await this.personaNaturalRepo.findOneBy({
          id_PersonaNatural: createEquipoDTO.id_personanatural,
        })
      : null;
    const plan = createEquipoDTO.id_plan
      ? await this.planesRepo.findOneBy({ id_plan: createEquipoDTO.id_plan })
      : null;

    //Crear el nuevo equipo
    const nuevoEquipo = this.equiposRepo.create({
      tipo: createEquipoDTO.tipo,
      marca: createEquipoDTO.marca,
      numero_serie: createEquipoDTO.numero_serie,
      nombre_usuario: createEquipoDTO.nombre_usuario,
      area: createEquipoDTO.area,
      ultRevision: createEquipoDTO.ultRevision,
      revProgramada: createEquipoDTO.revProgramada,

    });

    //Guardar el nuevo equipo en la base de datos
    return await this.equiposRepo.save(nuevoEquipo);
  }
}
