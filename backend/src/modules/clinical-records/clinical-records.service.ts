import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOdontogramDto } from './dto/update-odontogram.dto';
import {
  UpdatePeriodontogramDto,
  PeriodontalToothDto,
  PeriodontogramSummaryDto,
} from './dto/update-periodontogram.dto';

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

  /**
   * Obtiene los datos del periodontograma digital y sus métricas calculadas
   */
  async getPeriodontogram(patientId: string) {
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

    const periodontogramData = (record.periodontogramData as any) || {
      teeth: {},
      notes: '',
      summary: {
        olearyPlaqueIndex: 0,
        bleedingOnProbingIndex: 0,
        periodontalPocketsCount: 0,
        deepPocketsCount: 0,
        evaluatedTeethCount: 0,
      },
    };

    return {
      recordId: record.id,
      recordNumber: record.recordNumber,
      patient: record.patient,
      periodontogram: periodontogramData,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Valida, calcula el NIC (Nivel de Inserción Clínica = PS + MG), calcula índices
   * globales (O'Leary y BOP) y persiste el periodontograma con auditoría forense.
   */
  async updatePeriodontogram(
    patientId: string,
    dto: UpdatePeriodontogramDto,
    doctorId?: string,
  ) {
    const record = await this.prisma.clinicalRecord.findUnique({
      where: { patientId },
    });

    if (!record || record.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_CLINICAL_RECORD_NOT_FOUND',
        detail: `No se encontró el expediente clínico del paciente ${patientId}`,
      });
    }

    // Cálculo estricto de NIC e índices periodontales
    const computedData = this.calculatePeriodontogramMetrics(dto.teeth, dto.notes);

    const updated = await this.prisma.clinicalRecord.update({
      where: { id: record.id },
      data: {
        periodontogramData: computedData as any,
      },
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
          action: 'UPDATE_PERIODONTOGRAM',
          patientId,
          evaluatedTeeth: computedData.summary.evaluatedTeethCount,
          olearyIndex: computedData.summary.olearyPlaqueIndex,
          bopIndex: computedData.summary.bleedingOnProbingIndex,
          pocketsCount: computedData.summary.periodontalPocketsCount,
        },
      },
    });

    return {
      recordId: updated.id,
      recordNumber: updated.recordNumber,
      periodontogram: computedData,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Motor de cálculo periodontal:
   * 1. NIC = PS + MG en cada uno de los 6 sitios por diente.
   * 2. Índice de Placa Bacteriana de O'Leary (% sitios con placa).
   * 3. Índice de Sangrado al Sondaje (% BOP / sitios con sangrado).
   * 4. Cuantificación de bolsas periodontales leves/moderadas (PS >= 4mm) y severas (PS >= 6mm).
   */
  calculatePeriodontogramMetrics(
    teethInput: Record<string, PeriodontalToothDto>,
    notes?: string,
  ): {
    teeth: Record<string, PeriodontalToothDto>;
    notes?: string;
    summary: PeriodontogramSummaryDto;
  } {
    const teeth: Record<string, PeriodontalToothDto> = {};
    let totalSites = 0;
    let plaqueSites = 0;
    let bleedingSites = 0;
    let pocketsCount = 0;
    let deepPocketsCount = 0;
    let evaluatedTeethCount = 0;

    for (const [key, tooth] of Object.entries(teethInput || {})) {
      if (tooth.isMissing) {
        teeth[key] = { ...tooth };
        continue;
      }

      evaluatedTeethCount++;
      const processedTooth: PeriodontalToothDto = {
        ...tooth,
        vestibular: {
          distal: { ...tooth.vestibular.distal },
          middle: { ...tooth.vestibular.middle },
          mesial: { ...tooth.vestibular.mesial },
        },
        lingual: {
          distal: { ...tooth.lingual.distal },
          middle: { ...tooth.lingual.middle },
          mesial: { ...tooth.lingual.mesial },
        },
      };

      const sitesList = [
        processedTooth.vestibular.distal,
        processedTooth.vestibular.middle,
        processedTooth.vestibular.mesial,
        processedTooth.lingual.distal,
        processedTooth.lingual.middle,
        processedTooth.lingual.mesial,
      ];

      for (const site of sitesList) {
        totalSites++;

        // Regla Inviolable: NIC = Profundidad de Sondaje (PS) + Margen Gingival (MG)
        const ps = Number(site.probingDepth) || 0;
        const mg = Number(site.gingivalMargin) || 0;
        site.clinicalAttachmentLevel = ps + mg;

        if (site.plaque) {
          plaqueSites++;
        }
        if (site.bleeding) {
          bleedingSites++;
        }
        if (ps >= 6) {
          deepPocketsCount++;
          pocketsCount++;
        } else if (ps >= 4) {
          pocketsCount++;
        }
      }

      teeth[key] = processedTooth;
    }

    const olearyPlaqueIndex =
      totalSites > 0 ? Number(((plaqueSites / totalSites) * 100).toFixed(1)) : 0;
    const bleedingOnProbingIndex =
      totalSites > 0 ? Number(((bleedingSites / totalSites) * 100).toFixed(1)) : 0;

    const summary: PeriodontogramSummaryDto = {
      olearyPlaqueIndex,
      bleedingOnProbingIndex,
      periodontalPocketsCount: pocketsCount,
      deepPocketsCount,
      evaluatedTeethCount,
    };

    return {
      teeth,
      notes: notes || '',
      summary,
    };
  }
}

