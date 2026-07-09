// src/modules/usuario/usuario.controller.ts
import {
    Controller,
    Body,
    Patch,
    Get,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

// DTOs
import { UpdateProfileDTO } from './dto/update-profile.dto';

// Casos de Uso
import { UpdateProfileUseCase } from './application/update-profile.use-case';
import { GetProfileUseCase } from './application/get-profile.use-case';
import { ConfirmEmailUseCase } from './application/confirm-email.use-case';


@Controller('usuario')
export class UsuarioController {
    constructor(
        private readonly updateProfileUseCase: UpdateProfileUseCase,
        private readonly getProfileUseCase: GetProfileUseCase,
        private readonly confirmEmailUseCase: ConfirmEmailUseCase,
    ) {}

    //PATCH /usuario/perfil
    //Alcance: Todos los roles pueden modificar su propio perfil.
    //Solicita
    /*{
    "currentPassword": "contraseñaActual",
    "nombre": "NuevoNombre",
    "apellido": "NuevoApellido",
    "correo": "Correo",
    "telefono": "Telefono",
    "nuevaContraseña": "NuevaContraseña"
    }*/
    @Patch('perfil')
    @UseGuards(JwtAuthGuard)
    updateProfile(@Req() req: any, @Body() dto: UpdateProfileDTO) {
        return this.updateProfileUseCase.execute(req.user.userId, dto);
    }

    //Obtener tu propio perfil de usuario
    //GET /usuario/perfil
    //Alcance: Todos los roles pueden obtener su propio perfil.
    @Get('perfil')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: any) {
        return this.getProfileUseCase.execute(req.user.userId);
    }

    // GET /usuario/confirmar-correo?correo=...&token=...
    @Get('confirmar-correo')
    confirmEmail(@Query('correo') correo: string, @Query('token') token: string) {
        return this.confirmEmailUseCase.execute(correo, token);
    }

}
