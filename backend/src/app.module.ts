import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { EncryptionModule } from './common/services/encryption.module';
import { AuthModule } from './modules/auth/auth.module';
import { PatientsModule } from './modules/patients/patients.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { BillingModule } from './modules/billing/billing.module';
import { ClinicalRecordsModule } from './modules/clinical-records/clinical-records.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { TreatmentPlansCommissionsModule } from './modules/treatment-plans-commissions/treatment-plans-commissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    PrismaModule,
    RedisModule,
    EncryptionModule,
    AuthModule,
    PatientsModule,
    NotificationsModule,
    AppointmentsModule,
    BillingModule,
    ClinicalRecordsModule,
    InventoryModule,
    TreatmentPlansCommissionsModule,
  ],
})
export class AppModule {}

