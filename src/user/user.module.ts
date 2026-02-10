import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Usuario } from "../entities/Usuario.entity";
import { Rol } from "../entities/Rol.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
