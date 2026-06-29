import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../entities/Usuario.entity';
import { Clientes } from 'src/entities/Clientes.entity';
import { Sucursales } from 'src/entities/Sucursales.entity';
import { RegisterEmployeeDto } from '../dto/register-employee.dto';
import { UsuarioValidationService } from './common/usuario-validation.service';

@Injectable()
export class RegisterEmployeeUseCase {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
        @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
        @InjectRepository(Sucursales) private readonly sucursalRepo: Repository<Sucursales>,
        private readonly validationService: UsuarioValidationService,
    ) {}

    async execute(dto: RegisterEmployeeDto, userPayload: any) {
        const { role, clienteId } = userPayload;

        if (role === 'CLIENTE_EMPRESA') {
            dto.id_cliente = clienteId;
            if (['ADMINISTRADOR', 'CLIENTE_EMPRESA'].includes(dto.rolNombre)) {
                throw new BadRequestException('No tienes permisos para crear usuarios con ese nivel de acceso');
            }
        }

        await this.validationService.validateEmailUnique(dto.correo);
        const rol = await this.validationService.validateRoleExists(dto.rolNombre);

        let cliente: Clientes | null = null;
        let sucursal: Sucursales | null = null;

        if (dto.id_cliente) {
            cliente = await this.clientesRepo.findOne({ where: { id_cliente: dto.id_cliente } });
            if (!cliente) throw new NotFoundException(`Cliente/Empresa con ID ${dto.id_cliente} no existe`);
        }

        if (dto.id_sucursal) {
            sucursal = await this.sucursalRepo.findOne({ where: { id_sucursal: dto.id_sucursal } });
            if (!sucursal) throw new NotFoundException(`Sucursal con ID ${dto.id_sucursal} no existe`);
            if (cliente && sucursal.id_cliente !== cliente.id_cliente) {
                throw new BadRequestException('La sucursal indicada no pertenece a la empresa seleccionada');
            }
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const userData: Partial<Usuario> = {
            nombre: dto.nombre,
            apellido: dto.apellido,
            correo: dto.correo,
            telefono: dto.telefono,
            password: hashedPassword,
            rol: rol,
            id_cliente: cliente?.id_cliente,
            id_sucursal: sucursal?.id_sucursal,
            is_active: true,
        };

        const newUser = this.usuarioRepo.create(userData);
        const savedUser = await this.usuarioRepo.save(newUser);

        const { password, ...result } = savedUser;
        return result;
    }
}