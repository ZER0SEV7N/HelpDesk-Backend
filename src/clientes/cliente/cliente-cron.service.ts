import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule'; 
import { Clientes } from '@/entities/Clientes.entity';
import { ChatGateway } from '@/common/chat/chat.gateway';


@Injectable()
export class ClienteCronService {
  constructor(
    @InjectRepository(Clientes) private readonly clientesRepo: Repository<Clientes>,
    private readonly chatGateway: ChatGateway,
  ) {}

  // Tarea programada para desactivar clientes cuyo plan se ha vencido
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) 
  async automaticDeactivation() {
    console.log('Consultando todos los planes vencidos');
    const today = new Date(); 
    
    const clientesVencidos = await this.clientesRepo.find({
      where: { is_active: true, fecha_finalizacion_plan: LessThan(today) } 
    });

    if (clientesVencidos.length > 0) { 
      for (const cliente of clientesVencidos) {
        cliente.is_active = false;
      }
      await this.clientesRepo.save(clientesVencidos); 
      console.log(`Se encontraron ${clientesVencidos.length} clientes con planes vencidos`); 
    }
  }

  // Notificar a los clientes cuyo plan se vencerá en 7 días via WebSockets
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) 
  async notifyExpiringPlans() {
    console.log('Consultando planes que vencen en 7 dias'); 
    const today = new Date(); 
    today.setHours(0, 0, 0, 0); 
    
    const sevenDaysFromNow = new Date(today); 
    sevenDaysFromNow.setDate(today.getDate() + 7); 

    const clientesExpirando = await this.clientesRepo.find({
      where: { is_active: true, fecha_finalizacion_plan: Between(today, sevenDaysFromNow) } 
    });

    if (clientesExpirando.length > 0) { 
      for (const cliente of clientesExpirando) {
        const planDate = new Date(cliente.fecha_finalizacion_plan); 
        planDate.setHours(0, 0, 0, 0);
        
        const diffTime = planDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const notificacion = {
          tipo: 'Alerta_Plan', 
          titulo: diffDays === 0 ? 'Tu plan vence hoy' : `Tu plan vence en ${diffDays} día(s)`,
          Mensaje: diffDays === 0 
            ? 'Su servicio se suspenderá esta medianoche. Por favor, renueve su plan.' 
            : `Faltan ${diffDays} días para que su plan actual caduque.`, 
          fecha: new Date(), 
          leido: false, 
        };

        this.chatGateway.server
          .to(`empresa_${cliente.id_cliente}`)
          .emit('nueva_notificacion', notificacion); 
      }
    } else {
      console.log('No se encontraron clientes con planes que expiran en 7 dias');
    }
  }
}