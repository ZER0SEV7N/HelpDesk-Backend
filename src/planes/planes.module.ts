import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlanSchema } from '../schemas/plan.schema';
import { PlanesService } from './planes.service';
import { PlanesController } from './planes.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    AuthModule,
  ],
  controllers: [PlanesController],
  providers: [PlanesService],
})
export class PlanesModule {}
