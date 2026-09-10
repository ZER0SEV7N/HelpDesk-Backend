import { Controller, Get, Req, UseGuards, Request } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { JwtAuthGuard, JwtPayload } from '@/common/guards/jwt-auth.guard';

/**
 * Controlador único y centralizado para los Dashboards de la plataforma
 * Protegido por JWT. El caso de uso en el servicio determina las métricas según el rol del usuario.
 */
@Controller('dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  /**
   * Endpoint único para consultar el Dashboard.
   * Método: GET /dashboards
   * 
   * Extrae el payload del usuario autenticado desde el JWT (req.user)
   * y delega al servicio para retornar el dashboard correspondiente a su rol.
   */
  @Get()
  getDashboard(@Req() req: Request & { user: JwtPayload }) {
    return this.dashboardsService.getDashboard(req.user);
  }
}

