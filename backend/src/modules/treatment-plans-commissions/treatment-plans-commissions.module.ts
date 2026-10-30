import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TreatmentPlansService } from './treatment-plans.service';
import { TreatmentPlansController } from './treatment-plans.controller';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TreatmentPlansController, CommissionsController],
  providers: [TreatmentPlansService, CommissionsService],
  exports: [TreatmentPlansService, CommissionsService],
})
export class TreatmentPlansCommissionsModule {}
