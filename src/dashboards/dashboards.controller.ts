import { Controller, Get, Req, UseGuards, Request } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { JwtAuthGuard, JwtPayload } from '@/common/guards/jwt-auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/role.decorator';

@Controller('dashboards')
@UseGuards(JwtAuthGuard, RoleGuard)
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get('admin')
  @Roles('ADMINISTRADOR')
  getAdminDashboard() {
    return this.dashboardsService.getAdminDashboard();
  }

  @Get('soporte-tecnico')
  @Roles('SOPORTE_TECNICO')
  getSoporteTecnicoDashboard(@Req() req: Request & { user: JwtPayload }) {
    return this.dashboardsService.getSoporteTecnicoDashboard(req.user);
  }

  @Get('soporte-insitu')
  @Roles('SOPORTE_INSITU')
  getSoporteInsituDashboard(@Req() req: Request & { user: JwtPayload }) {
    return this.dashboardsService.getSoporteInsituDashboard(req.user);
  }

  @Get('empresa')
  @Roles('CLIENTE_EMPRESA')
  getClienteEmpresaDashboard(@Req() req: Request & { user: JwtPayload }) {
    return this.dashboardsService.getClienteEmpresaDashboard(req.user);
  }

  @Get('sucursal')
  @Roles('CLIENTE_SUCURSAL')
  getClienteSucursalDashboard(@Req() req: Request & { user: JwtPayload }) {
    return this.dashboardsService.getClienteSucursalDashboard(req.user);
  }

  @Get('trabajador')
  @Roles('CLIENTE_TRABAJADOR')
  getClienteTrabajadorDashboard(@Req() req: Request & { user: JwtPayload }) {
    return this.dashboardsService.getClienteTrabajadorDashboard(req.user);
  }
}
