//src/clientes/clientes.service.ts
//Servicio para la gestion de clientes
//Importaciones necesarias:
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Clientes } from 'src/entities/Clientes.entity';
import { Planes } from 'src/entities/Planes.entity';
import { Sucursales } from 'src/entities/Sucursales.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { Area } from 'src/entities/Area.entity';
import { Usuario } from 'src/entities/Usuario.entity';
import { Equipos } from 'src/entities/Equipos.entity';
import { ChatGateway } from 'src/chat/chat.gateway';

//Definicion del servicio ClientesService
@Injectable()
export class ClientesService {
    constructor(
        @InjectRepository(Clientes)
        private clientesRepo: Repository<Clientes>,
        @InjectRepository(Planes)
        private planesRepo: Repository<Planes>,
        @InjectRepository(Sucursales)
        private sucursalesRepo: Repository<Sucursales>,
        @InjectRepository(Area)
        private areaRepo: Repository<Area>,
        @InjectRepository(Usuario)
        private usuariosRepo: Repository<Usuario>,
        @InjectRepository(Equipos)
        private equiposRepo: Repository<Equipos>,
        private readonly chatGateway: ChatGateway,
    ) {}

    //Tarea programada para desactivar clientes cuyo plan se ha vencido
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async automaticDeactivation() {
        console.log('Consultando todos los planes vencidos');
        const today = new Date();
        //Buscar clientes activo cuya fecha de finalizacion ya paso
        const clientesVencidos = await this.clientesRepo.find({
            where: {
                is_active: true,
                fecha_finalizacion_plan: LessThan(today)
            }
        });

        //Si se encuentran clientes vencidos, se desactivan y se guarda el cambio en la base de datos
        if(clientesVencidos.length > 0) {
            for(const cliente of clientesVencidos) {
                cliente.is_active = false;
            }
            await this.clientesRepo.save(clientesVencidos);
            console.log(`Se encontraron ${clientesVencidos.length} clientes con planes vencidos`);
        }
    }

    //Notificar a los clientes cuyo plan se vencera en 7 dias
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async notifyExpiringPlans() {
        console.log('Consultando planes que vencen en 7 dias');
        //Calcular la fecha dentro de 7 dias
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);
        //Buscar clientes activo cuya fecha de finalizacion es dentro de 7 dias
        const clientesExpirando = await this.clientesRepo.find({
            where: {
                is_active: true,
                fecha_finalizacion_plan: Between(today, sevenDaysFromNow),
            }
        });

        if(clientesExpirando.length > 0){
            for(const cliente of clientesExpirando){
                //Implementar la logica para enviar notificaciones a los clientes (ej: correo electronico)
                const planDate = new Date(cliente.fecha_finalizacion_plan);
                planDate.setHours(0,0,0,0);
                
                //Calcular la diferencia en dias entre la fecha de finalizacion del plan y la fecha actual
                const diffTime = planDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

               const notificacion = {
                tipo: 'Alerta_Plan',
                titulo: diffDays === 0 ? 'Tu plan vence hoy' : `Tu plan vence en ${diffDays} día(s)`,
                Mensaje: diffDays === 0 
                        ? 'Su servicio se suspenderá esta medianoche. Por favor, renueve su plan.' 
                        : `Faltan ${diffDays} días para que su plan actual caduque.`,
                fecha: new Date(),
                leido: false,
               };
               this.chatGateway.server
                    .to(`empresa_${cliente.id_cliente}`)
                    .emit('nueva_notificacion', notificacion);
            }
        }
        else console.log('No se encontraron clientes con planes que expiran en 7 dias');
    }

    //Crear una nueva empresa
    async create(dto: CreateClienteDto, suc: Partial<CreateSucursalDto>) {
        //Verificar que no se repita el numero de documento
        const exists = await this.clientesRepo.findOne({
            where: {numero_documento: dto.numero_documento}
        });

        if(exists) throw new ConflictException(`Ya existe un cliente con ese documento ${dto.numero_documento}`);

        if(dto.id_plan){
            const planExists = await this.planesRepo.findOne({ where: {id_plan: dto.id_plan}});
            if(!planExists) throw new NotFoundException(`El plan con el ID ${dto.id_plan} no ha sido encontrado`);
        }
        //Crear el cliente
        const nuevoCliente = this.clientesRepo.create(dto)
        const clienteGuardado = await this.clientesRepo.save(nuevoCliente);

        //Validar que el ID del cliente en el DTO de sucursal coincida con el cliente creado (si se proporciona)
        if(suc.id_cliente && suc.id_cliente !== clienteGuardado.id_cliente){
            throw new BadRequestException('El ID del cliente en el DTO de sucursal no coincide con el cliente creado');
        }
        //Autocrear la sucursal principal para el cliente
        //Se asignan valores por defecto en caso de que no se proporcionen en el DTO de sucursal
        const sucursalPrincipal = this.sucursalesRepo.create({
            nombre_sucursal: suc.nombre_sucursal || 'Sucursal Principal',
            encargado: suc.encargado || 'Por Asignar',
            telefono: suc.telefono || 'sin especificar',
            correo: suc.correo  ||'sin especificar@example.com',
            direccion: suc.direccion || 'sin especificar',
            cliente: clienteGuardado
        });
        await this.sucursalesRepo.save(sucursalPrincipal);

        //Retornar el cliente con su sucursal principal creada
        return this.findOne(clienteGuardado.id_cliente)
    }

    //Listar todas las empresas
    async findAll() {
        return await this.clientesRepo.find({
        relations: ['sucursales', 'plan'],
        });
    }

    //Encontrar un cliente
    async findOne(id: number) {
        const cliente = await this.clientesRepo.findOne({
            where: { id_cliente: id },
            relations: ['sucursales', 'equipos', 'plan'],
        });

        if (!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        return cliente;
    }

    //Actualizar los datos de un cliente
    async update(id: number, dto: Partial<CreateClienteDto>){
        const cliente = await this.clientExists(id);

        //Verificar que el documento no esté duplicado
        if(dto.numero_documento && dto.numero_documento !== cliente.numero_documento){
            const exists = await this.clientesRepo.findOne({
                where: {numero_documento: dto.numero_documento}
            });
            if(exists) throw new ConflictException(`Ya existe un cliente con ese documento ${dto.numero_documento}`);
        }
        Object.assign(cliente, dto);
        return this.clientesRepo.save(cliente);
    }

    //Desactivar un cliente manualmente (no se eliminará de la base de datos por integridad referencial, solo se marcará como inactivo)
    async deactivate(id: number) {
        //Validar que el cliente exista
        const cliente = await this.clientExists(id);
        if(!cliente.is_active) throw new BadRequestException('El cliente ya se encuentra inactivo');

        cliente.is_active = false;
        await this.clientesRepo.save(cliente);

        const sucursales = await this.sucursalesRepo.find({
            where: { id_cliente: id },
            select: ['id_sucursal']
        });

        if(sucursales.length > 0) {
            const sucursalIds = sucursales.map(s => s.id_sucursal);
            //Desactivar todas las sucursales del cliente
            await this.sucursalesRepo.update(sucursalIds, { is_active: false });
            //Desactivar todas las áreas asociadas a las sucursales del cliente
            await this.areaRepo.update({ id_sucursal: In(sucursalIds) }, { is_active: false });
            //Apagón de Usuarios:
            await this.usuariosRepo.update({ id_cliente: id }, { is_active: false });
            await this.equiposRepo.update({ id_cliente: id }, { is_active: false });
        }
        return { message: `Cliente ${cliente.nombre_principal} y sus sucursales han sido desactivados` };

    }

    //Actualizar el contrato de un cliente
    async updatePlan(id: number, id_plan: number, nuevaFechaFin: string ){
        //Verificar que el cliente exista
        const cliente = await this.clientExists(id);

        //Verificar que el plan exista
        const plan = await this.planesRepo.findOne({ where: {id_plan: id_plan}});
        if(!plan) throw new NotFoundException(`El plan con el ID ${id_plan} no ha sido encontrado`);

        //Actualizar el plan del cliente
        cliente.plan = plan;
        cliente.fecha_finalizacion_plan = new Date(nuevaFechaFin);
        //Si el cliente estaba desactivado, se reactiva al actualizar su plan
        if(!cliente.is_active) { 
            cliente.is_active = true; 
            const sucursales = await this.sucursalesRepo.find({
                where: { id_cliente: id },
                select: ['id_sucursal']
            });

            if(sucursales.length > 0) {
                const sucursalIds = sucursales.map(s => s.id_sucursal);
                //Reactivar todas las sucursales del cliente
                await this.sucursalesRepo.update(sucursalIds, { is_active: true });
                //Reactivar todas las áreas asociadas a las sucursales del cliente
                await this.areaRepo.update({ id_sucursal: In(sucursalIds) }, { is_active: true });
                //Reactivación de Usuarios:
                await this.usuariosRepo.update({ id_cliente: id }, { is_active: true });
                await this.equiposRepo.update({ id_cliente: id }, { is_active: true });
            }
        }
        await this.clientesRepo.save(cliente);
        return { 
            message: `Plan del cliente ${cliente.nombre_principal} actualizado a ${plan.Tipo} con fecha de finalización ${nuevaFechaFin}. El cliente ha sido reactivado junto con sus sucursales y áreas asociadas.`,
            cliente: cliente
        };
    }

    private async clientExists(id: number): Promise<Clientes> {
        const cliente = await this.clientesRepo.findOne({ where: {id_cliente: id}});
        if(!cliente) throw new NotFoundException(`Cliente con el ID ${id} no ha sido encontrado`);
        return cliente;
    }
}
