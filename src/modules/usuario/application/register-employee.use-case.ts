import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '@/entities/Usuario.entity';
import { Clientes } from '@/entities/Clientes.entity';
import { Sucursales } from '@/entities/Sucursales.entity';
import { Rol } from '@/entities/Rol.entity';
import { RegisterEmployeeDto } from '../dto/register-employee.dto';
import { EmployeeRegistrationManager } from '../managers/employee-registration.manager';

@Injectable()
export class RegisterEmployeeUseCase {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
        @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
        @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
        @InjectRepository(Sucursales) private readonly sucursalRepo: Repository<Sucursales>,
        private readonly registrationManager: EmployeeRegistrationManager,
    ) {}

    async execute(dto: RegisterEmployeeDto, userPayload: any) {
        const { role, clienteId } = userPayload;

        // Restricciones por rol
        if (role === 'CLIENTE_EMPRESA') {
            dto.id_cliente = clienteId;
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(dto.rolNombre)) {
                throw new BadRequestException('No tienes permisos para crear usuarios con ese nivel de acceso');
            }
        }

        // Evitar colisión de correo
        const emailExists = await this.usuarioRepo.findOne({ where: { correo: dto.correo } });
        if (emailExists) throw new ConflictException('El correo ya está registrado por otro usuario');

        // Validar rol
        const rol = await this.rolRepo.findOne({ where: { nombre: dto.rolNombre } });
        if (!rol) throw new NotFoundException(`El rol ${dto.rolNombre} no existe`);

        // Validar jerarquía empresa/sucursal
        await this.validateHierarchy(dto.id_cliente, dto.id_sucursal);

        // Delegar al manager que maneja Redis + WebSocket + Email
        return this.registrationManager.initiateVerification(dto, userPayload);
    }

    private async validateHierarchy(idCliente?: number, idSucursal?: number): Promise<void> {
        const cliente = idCliente
            ? await this.clientesRepo.findOne({ where: { id_cliente: idCliente } })
            : null;
        const sucursal = idSucursal
            ? await this.sucursalRepo.findOne({ where: { id_sucursal: idSucursal } })
            : null;

        if (idCliente && !cliente) throw new NotFoundException(`Empresa con ID ${idCliente} no existe`);
        if (idSucursal && !sucursal) throw new NotFoundException(`Sucursal con ID ${idSucursal} no existe`);
        if (cliente && sucursal && sucursal.id_cliente !== cliente.id_cliente) {
            throw new BadRequestException('La sucursal indicada no pertenece a la empresa seleccionada');
        }
    }
}
