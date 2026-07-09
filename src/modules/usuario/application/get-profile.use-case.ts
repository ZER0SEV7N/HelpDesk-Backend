import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '@/entities/Usuario.entity';

@Injectable()
export class GetProfileUseCase {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    ) {}

    async execute(userId: number) {
        const user = await this.usuarioRepo.findOne({
            where: { id_usuario: userId },
            relations: ['rol'],
        });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        const { password, ...result } = user;
        return result;
    }
}
