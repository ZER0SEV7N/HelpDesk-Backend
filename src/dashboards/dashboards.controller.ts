import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
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
}
