import { Module } from '@nestjs/common';
import { ClinicalRecordsService } from './clinical-records.service';
import { ClinicalRecordsController } from './clinical-records.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClinicalRecordsController],
  providers: [ClinicalRecordsService],
  exports: [ClinicalRecordsService],
})
export class ClinicalRecordsModule {}
