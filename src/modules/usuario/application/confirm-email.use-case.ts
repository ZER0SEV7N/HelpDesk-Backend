import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '@/entities/Usuario.entity';
import { Rol } from '@/entities/Rol.entity';
import { EmployeeRegistrationManager } from '../managers/employee-registration.manager';

@Injectable()
export class ConfirmEmailUseCase {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
        @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
        private readonly registrationManager: EmployeeRegistrationManager,
    ) {}

    async execute(correo: string, token: string) {
        // Confirmar token y recuperar DTO desde Redis
        const validatedDto = await this.registrationManager.confirmEmail(correo, token);

        const rol = await this.rolRepo.findOne({ where: { nombre: validatedDto.rolNombre } });
        if (!rol) throw new NotFoundException(`El rol ${validatedDto.rolNombre} no existe`);

        const hashedPassword = await bcrypt.hash(validatedDto.password, 10);

        const newUser = this.usuarioRepo.create({
            ...validatedDto,
            password: hashedPassword,
            rol: rol,
            is_active: true,
        });

        const savedUser = await this.usuarioRepo.save(newUser);
        const { password, ...result } = savedUser;

        return {
            message: `El empleado ${savedUser.nombre} ha sido verificado y guardado con éxito.`,
            user: result,
        };
    }
}
