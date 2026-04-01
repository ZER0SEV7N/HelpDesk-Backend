// src/equipos/equipos.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipos } from '../entities/Equipos.entity';
import { Usuario } from '../entities/Usuario.entity'; // Necesario para buscar los datos del usuario que consulta
import { CreateEquipoDTO } from './dto/create-equipos.dto';
import { UpdateEquipoDto } from './dto/update-equipos.dto';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipos)
    private readonly equiposRepo: Repository<Equipos>,

    // Inyectamos al usuario para poder revisar a qué empresa pertenece
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  // --------------------------------------------------------
  // 1. REGISTRAR UN NUEVO EQUIPO (Solo los datos de la PC)
  // --------------------------------------------------------
  async create(dto: CreateEquipoDTO) {
    const equipo = this.equiposRepo.create(dto as Partial<Equipos>);
    return await this.equiposRepo.save(equipo);
    // Nota: El hardware y software se le instala DESPUÉS usando los endpoints de hardware y software.
  }

  // --------------------------------------------------------
  // 2. LISTAR EQUIPOS CON FILTRO INTELIGENTE DE ROLES
  // --------------------------------------------------------
  async findAll(userToken: any) {
    // 1. Buscamos al usuario real en la BD para saber su id_cliente e id_sucursal
    const usuarioReal = await this.usuarioRepo.findOneBy({ id_usuario: userToken.userId });
    if (!usuarioReal) throw new NotFoundException('Usuario no válido');

    // 2. Preparamos la consulta con todas las relaciones bonitas
    const query = this.equiposRepo.createQueryBuilder('equipo')
      .leftJoinAndSelect('equipo.cliente', 'cliente')
      .leftJoinAndSelect('equipo.sucursal', 'sucursal')
      .leftJoinAndSelect('equipo.historial_hardware', 'historial_hardware')
      .leftJoinAndSelect('historial_hardware.hardware', 'hardware')
      .leftJoinAndSelect('equipo.software_instalado', 'software_instalado')
      .leftJoin('software_instalado.soft', 'soft')
      .addSelect(['soft.id_software', 'soft.nombre_software', 'soft.licencia'])
      .where('equipo.is_active = :isActive', { isActive: true });

    // 3. Aplicamos el candado según el rol
    switch (userToken.role) {
      case 'ADMINISTRADOR':
      case 'SOPORTE_TECNICO':
      case 'SOPORTE_INSITU':
        // El equipo de Zaint puede ver TODOS los equipos registrados
        break; 

      case 'CLIENTE_EMPRESA':
        // El gerente solo ve los equipos de su empresa
        query.andWhere('equipo.id_cliente = :idCliente', { idCliente: usuarioReal.id_cliente });
        break;

      case 'CLIENTE_SUCURSAL':
        // El encargado solo ve los equipos de su sucursal específica
        query.andWhere('equipo.id_sucursal = :idSucursal', { idSucursal: usuarioReal.id_sucursal });
        break;

      case 'CLIENTE_TRABAJADOR':
        // El empleado normal solo ve el equipo que tiene su nombre asignado
        query.andWhere('equipo.nombre_usuario = :nombre', { nombre: usuarioReal.nombre });
        break;

      default:
        throw new ForbiddenException('No tienes permisos para ver el inventario.');
    }

    return await query.getMany();
  }

  // --------------------------------------------------------
  // 3. OBTENER DETALLE DE UN EQUIPO ESPECÍFICO
  // --------------------------------------------------------
  async findOne(id: number, userToken: any) {
    // Reutilizamos la lógica del findAll para asegurar que el usuario tenga permiso de ver ESTE equipo específico
    const equiposPermitidos = await this.findAll(userToken);
    const equipo = equiposPermitidos.find(e => e.id_equipo === id);

    if (!equipo) {
      throw new NotFoundException(`Equipo con id ${id} no encontrado o no tienes permiso para verlo`);
    }

    return equipo;
  }

  // --------------------------------------------------------
  // 4. ACTUALIZAR DATOS DE LA COMPUTADORA
  // --------------------------------------------------------
  async update(id: number, dto: UpdateEquipoDto, userToken: any) {
    // Validamos que el equipo exista y tengamos permiso de tocarlo
    await this.findOne(id, userToken); 

    const equipo = await this.equiposRepo.preload({
      id_equipo: id,
      ...(dto as Partial<Equipos>),
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con id ${id} no encontrado`);
    }

    return await this.equiposRepo.save(equipo);
  }

  // --------------------------------------------------------
  // 5. ELIMINAR UN EQUIPO (Soft Delete)
  // --------------------------------------------------------
  async remove(id: number, userToken: any) {
    // Validamos permisos
    const equipo = await this.findOne(id, userToken);

    if (!equipo.is_active) throw new BadRequestException('El equipo ya está inactivo');

    equipo.is_active = false;
    await this.equiposRepo.save(equipo);

    return { message: `Equipo con id ${id} dado de baja correctamente del sistema` };
  }

  //6. Asignar un equipo a un trabajador
  async assignToWorker(id: number, nombre_usuario: string, area: string, id_sucursal: number, userToken: any) {
    //Buscar un equipo validando que el usuario tenga permiso
    const equipo = await this.findOne(id, userToken);

    //Actualizar los datos de ubicacion y dueño
    equipo.nombre_usuario = nombre_usuario;
    equipo.area = area;

    //Si el gerente o encargado decide mover la pc a otra sucursal, se actualiza la sucursal
    if(id_sucursal) equipo.id_sucursal = id_sucursal;

    const equipoActualizado = await this.equiposRepo.save(equipo);
    return { 
        message: `Equipo asignado exitosamente a ${nombre_usuario} en el área de ${area}`,
        equipo: equipoActualizado
    };
  }

  //Liberar un equipo de un trabajador (dejarlo sin dueño)
  async unassignFromWorker(id: number, userToken: any) {
    //Buscar un equipo validando que el usuario tenga permiso
    const equipo = await this.findOne(id, userToken);
    //Actualizar los datos de ubicacion y dueño
    equipo.nombre_usuario = 'Sin asignar';
    equipo.area = 'Sin asignar';
    const equipoActualizado = await this.equiposRepo.save(equipo);
    return { 
        message: `Equipo liberado exitosamente`,
        equipo: equipoActualizado
    };
  }
}