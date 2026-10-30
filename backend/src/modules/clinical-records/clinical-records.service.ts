import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOdontogramDto } from './dto/update-odontogram.dto';

@Injectable()
export class ClinicalRecordsService {
  private readonly logger = new Logger(ClinicalRecordsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el odontograma inicial y evolutivo de un paciente
   */
  async getOdontogram(patientId: string) {
    const record = await this.prisma.clinicalRecord.findUnique({
      where: { patientId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentType: true,
            documentNumber: true,
            birthDate: true,
          },
        },
      },
    });

    if (!record || record.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_CLINICAL_RECORD_NOT_FOUND',
        detail: `No se encontró el expediente clínico del paciente ${patientId}`,
      });
    }

    return {
      recordId: record.id,
      recordNumber: record.recordNumber,
      patient: record.patient,
      visibleAlerts: record.visibleAlerts,
      initialOdontogram: record.initialOdontogram || {},
      evolutionaryOdontogram: record.evolutionaryOdontogram || record.initialOdontogram || {},
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Actualiza el odontograma (Inicial o Evolutivo) con registro forense de auditoría
   */
  async updateOdontogram(patientId: string, dto: UpdateOdontogramDto, doctorId?: string) {
    const record = await this.prisma.clinicalRecord.findUnique({
      where: { patientId },
    });

    if (!record || record.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_CLINICAL_RECORD_NOT_FOUND',
        detail: `No se encontró el expediente clínico del paciente ${patientId}`,
      });
    }

    const updateData: any = {};
    if (dto.mode === 'INITIAL') {
      updateData.initialOdontogram = dto.teeth as any;
      // Si el evolutivo aún no existe, inicializarlo con el inicial
      if (!record.evolutionaryOdontogram) {
        updateData.evolutionaryOdontogram = dto.teeth as any;
      }
    } else {
      updateData.evolutionaryOdontogram = dto.teeth as any;
    }

    const updated = await this.prisma.clinicalRecord.update({
      where: { id: record.id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentNumber: true,
          },
        },
      },
    });

    // Auditoría forense LOPDP
    await this.prisma.auditLog.create({
      data: {
        userId: doctorId,
        action: 'UPDATE',
        resource: 'clinical_records',
        resourceId: record.id,
        metadata: {
          action: 'UPDATE_ODONTOGRAM',
          patientId,
          mode: dto.mode,
          teethCount: Object.keys(dto.teeth || {}).length,
          generalNotes: dto.generalNotes,
        },
      },
    });

    return {
      recordId: updated.id,
      recordNumber: updated.recordNumber,
      modeUpdated: dto.mode,
      initialOdontogram: updated.initialOdontogram,
      evolutionaryOdontogram: updated.evolutionaryOdontogram,
      updatedAt: updated.updatedAt,
    };
  }
}
