import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Usuario } from "../entities/Usuario.entity";
import { Rol } from "../entities/Rol.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) {}

  // REGISTRO → TRABAJADOR
  async createUser(data: any) {
    const rolTrabajador = await this.rolRepo.findOne({
      where: { nombre: "TRABAJADOR" },
    });

    if (!rolTrabajador) {
      throw new BadRequestException("No existe el rol TRABAJADOR");
    }

    const usuario = this.usuarioRepo.create({
      ...data,
      rol: rolTrabajador,
    });

    return this.usuarioRepo.save(usuario);
  }

  // SOLO ADMIN CAMBIA ROL
  async changeRole(adminId: number, userId: number, role: string) {
    const admin = await this.usuarioRepo.findOne({
      where: { id_usuario: adminId },
      relations: ["rol"],
    });

    if (!admin || admin.rol.nombre !== "ADMIN") {
      throw new BadRequestException("Solo administrador puede cambiar roles");
    }

    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: userId },
      relations: ["rol"],
    });

    if (!usuario) {
      throw new BadRequestException("Usuario no encontrado");
    }

    let nuevoRol = await this.rolRepo.findOne({
    where: { nombre: role },
    });

    if (!nuevoRol) {
    nuevoRol = await this.rolRepo.findOne({
        where: { nombre: "TRABAJADOR" },
    });
    }

    if (!nuevoRol) {
    throw new BadRequestException("No existe el rol solicitado");
    }

    usuario.rol = nuevoRol;


    await this.usuarioRepo.save(usuario);

    return {
      message: "Rol actualizado correctamente",
      rol: nuevoRol.nombre,
    };
  }
}
