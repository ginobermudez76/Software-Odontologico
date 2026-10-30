import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOdontogramDto } from './dto/update-odontogram.dto';
import {
  UpdatePeriodontogramDto,
  PeriodontalToothDto,
  PeriodontogramSummaryDto,
} from './dto/update-periodontogram.dto';
import {
  CreateEvolutionNoteDto,
  UpdateEvolutionNoteDto,
  CreateAdendaDto,
} from './dto/evolution-note.dto';
import { CreateConsentDto, SignConsentDto } from './dto/consent.dto';
import { CreatePrescriptionDto } from './dto/prescription.dto';

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

  // ==========================================
  // SPRINT 7: NOTAS DE EVOLUCIÓN SOEP & ADENDAS
  // ==========================================

  /**
   * Obtiene todas las notas de evolución clínica SOEP del paciente con sus adendas,
   * calculando el estado de inmutabilidad (24 horas transcurridas).
   */
  async getEvolutionNotes(patientId: string) {
    const record = await this.prisma.clinicalRecord.findUnique({
      where: { patientId },
    });

    if (!record || record.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_CLINICAL_RECORD_NOT_FOUND',
        detail: `No se encontró el expediente clínico del paciente ${patientId}`,
      });
    }

    const notes = await this.prisma.evolutionNote.findMany({
      where: {
        clinicalRecordId: record.id,
        isAdenda: false,
        isDeleted: false,
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        adendas: {
          where: { isDeleted: false },
          include: {
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular estado reactivo de inmutabilidad según Regla RN-01 (24 horas)
    const now = Date.now();
    const formattedNotes = notes.map((note) => {
      const createdTime = new Date(note.createdAt).getTime();
      const hoursElapsed = (now - createdTime) / (1000 * 60 * 60);
      const isEditable = !note.isLocked && hoursElapsed < 24;
      const remainingHours = isEditable ? Math.max(0, 24 - hoursElapsed) : 0;

      return {
        id: note.id,
        clinicalRecordId: note.clinicalRecordId,
        doctorId: note.doctorId,
        doctor: note.doctor,
        subjective: note.subjective,
        objective: note.objective,
        assessment: note.assessment,
        plan: note.plan,
        isLocked: note.isLocked || !isEditable,
        isEditable,
        remainingHoursToEdit: Number(remainingHours.toFixed(1)),
        isAdenda: note.isAdenda,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        adendas: note.adendas.map((adenda) => ({
          id: adenda.id,
          doctorId: adenda.doctorId,
          doctor: adenda.doctor,
          clarificationText: adenda.assessment,
          subjective: adenda.subjective,
          plan: adenda.plan,
          createdAt: adenda.createdAt,
        })),
      };
    });

    return {
      recordId: record.id,
      patientId,
      totalNotes: formattedNotes.length,
      notes: formattedNotes,
    };
  }

  /**
   * Crea una nueva nota de evolución clínica SOEP
   */
  async createEvolutionNote(
    patientId: string,
    dto: CreateEvolutionNoteDto,
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

    const note = await this.prisma.evolutionNote.create({
      data: {
        clinicalRecordId: record.id,
        doctorId: doctorId || '00000000-0000-0000-0000-000000000001',
        subjective: dto.subjective,
        objective: dto.objective,
        assessment: dto.assessment,
        plan: dto.plan,
        isLocked: false,
        isAdenda: false,
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Auditoría forense LOPDP
    await this.prisma.auditLog.create({
      data: {
        userId: doctorId,
        action: 'CREATE',
        resource: 'evolution_notes',
        resourceId: note.id,
        metadata: {
          action: 'CREATE_SOEP_NOTE',
          patientId,
          clinicalRecordId: record.id,
        },
      },
    });

    return {
      ...note,
      isEditable: true,
      remainingHoursToEdit: 24,
      adendas: [],
    };
  }

  /**
   * Modifica una nota SOEP existente si no han transcurrido más de 24 horas.
   * Regla Inviolable RN-01: Pasadas 24 horas, rechaza con HTTP 403 Forbidden.
   */
  async updateEvolutionNote(
    noteId: string,
    dto: UpdateEvolutionNoteDto,
    userId?: string,
  ) {
    const note = await this.prisma.evolutionNote.findUnique({
      where: { id: noteId },
    });

    if (!note || note.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_NOTE_NOT_FOUND',
        detail: `No se encontró la nota de evolución con ID ${noteId}`,
      });
    }

    // Regla de Inmutabilidad RN-01 (Bloqueo a las 24 horas)
    const hoursElapsed = (Date.now() - new Date(note.createdAt).getTime()) / (1000 * 60 * 60);
    if (note.isLocked || hoursElapsed >= 24) {
      throw new ForbiddenException({
        errorCode: 'ERR_NOTE_LOCKED_AFTER_24H',
        detail:
          'Inmutabilidad médica: No es posible modificar una nota clínica transcurridas 24 horas desde su creación. Utilice una Nota de Adenda / Aclaratoria.',
      });
    }

    const updated = await this.prisma.evolutionNote.update({
      where: { id: noteId },
      data: {
        subjective: dto.subjective,
        objective: dto.objective,
        assessment: dto.assessment,
        plan: dto.plan,
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Auditoría forense LOPDP
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        resource: 'evolution_notes',
        resourceId: note.id,
        metadata: {
          action: 'UPDATE_SOEP_NOTE',
          hoursElapsed: Number(hoursElapsed.toFixed(2)),
        },
      },
    });

    return {
      ...updated,
      isEditable: true,
      remainingHoursToEdit: Number(Math.max(0, 24 - hoursElapsed).toFixed(1)),
    };
  }

  /**
   * Genera una Nota de Adenda / Aclaratoria formal vinculada a la nota original inmutable
   */
  async createAdenda(
    noteId: string,
    dto: CreateAdendaDto,
    doctorId?: string,
  ) {
    const originalNote = await this.prisma.evolutionNote.findUnique({
      where: { id: noteId },
    });

    if (!originalNote || originalNote.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_NOTE_NOT_FOUND',
        detail: `No se encontró la nota original con ID ${noteId}`,
      });
    }

    const adenda = await this.prisma.evolutionNote.create({
      data: {
        clinicalRecordId: originalNote.clinicalRecordId,
        doctorId: doctorId || '00000000-0000-0000-0000-000000000001',
        subjective: `ADENDA MÉDICA: ${dto.reason || 'Rectificación o Aclaración Clínica'}`,
        objective: `Referencia a nota clínica del ${new Date(originalNote.createdAt).toLocaleString()}`,
        assessment: dto.clarificationText,
        plan: 'Anexo aclaratorio legal al expediente clínico.',
        isLocked: true, // Las adendas son inmutables desde su registro
        isAdenda: true,
        originalNoteId: originalNote.id,
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Auditoría forense LOPDP
    await this.prisma.auditLog.create({
      data: {
        userId: doctorId,
        action: 'CREATE',
        resource: 'evolution_notes',
        resourceId: adenda.id,
        metadata: {
          action: 'CREATE_ADENDA',
          originalNoteId: originalNote.id,
          reason: dto.reason,
        },
      },
    });

    return {
      id: adenda.id,
      originalNoteId: originalNote.id,
      doctorId: adenda.doctorId,
      doctor: adenda.doctor,
      clarificationText: adenda.assessment,
      subjective: adenda.subjective,
      createdAt: adenda.createdAt,
    };
  }

  // ==========================================
  // SPRINT 8: CONSENTIMIENTO INFORMADO & RECETAS
  // ==========================================

  /**
   * Obtiene todos los consentimientos informados del paciente
   */
  async getConsents(patientId: string) {
    const record = await this.prisma.clinicalRecord.findUnique({
      where: { patientId },
    });

    if (!record || record.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_CLINICAL_RECORD_NOT_FOUND',
        detail: `No se encontró el expediente clínico del paciente ${patientId}`,
      });
    }

    const consents = await this.prisma.informedConsent.findMany({
      where: {
        clinicalRecordId: record.id,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      recordId: record.id,
      patientId,
      totalConsents: consents.length,
      consents,
    };
  }

  /**
   * Crea un consentimiento informado para un procedimiento invasivo o quirúrgico
   */
  async createConsent(
    patientId: string,
    dto: CreateConsentDto,
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

    const consent = await this.prisma.informedConsent.create({
      data: {
        clinicalRecordId: record.id,
        procedureName: dto.procedureName,
        risksDescription: dto.risksDescription,
        isSigned: false,
      },
    });

    // Auditoría forense
    await this.prisma.auditLog.create({
      data: {
        userId: doctorId,
        action: 'CREATE',
        resource: 'informed_consents',
        resourceId: consent.id,
        metadata: {
          action: 'CREATE_CONSENT',
          procedureName: dto.procedureName,
          clinicalRecordId: record.id,
        },
      },
    });

    return consent;
  }

  /**
   * Firma biométrica del consentimiento informado con hash criptográfico SHA-256 e IP
   */
  async signConsent(
    consentId: string,
    dto: SignConsentDto,
    clientIp?: string,
  ) {
    const consent = await this.prisma.informedConsent.findUnique({
      where: { id: consentId },
    });

    if (!consent || consent.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_CONSENT_NOT_FOUND',
        detail: `No se encontró el consentimiento informado con ID ${consentId}`,
      });
    }

    if (consent.isSigned) {
      throw new ConflictException({
        errorCode: 'ERR_CONSENT_ALREADY_SIGNED',
        detail: 'Este consentimiento informado ya fue firmado y es inalterable.',
      });
    }

    const signedAt = new Date();
    const effectiveIp = dto.signerIp || clientIp || '127.0.0.1';

    // Generar Hash criptográfico SHA-256 de inmutabilidad
    const dataToHash = `${consent.id}|${consent.procedureName}|${consent.risksDescription}|${dto.signatureData}|${effectiveIp}|${signedAt.toISOString()}`;
    const documentHash = createHash('sha256').update(dataToHash).digest('hex');

    const updated = await this.prisma.informedConsent.update({
      where: { id: consentId },
      data: {
        patientSignature: dto.signatureData,
        isSigned: true,
        signedAt,
        signerIp: effectiveIp,
        documentHash,
        otpCode: dto.otpCode,
      },
    });

    // Auditoría forense LOPDP
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        resource: 'informed_consents',
        resourceId: consent.id,
        metadata: {
          action: 'SIGN_CONSENT',
          documentHash,
          signerIp: effectiveIp,
          isOtp: Boolean(dto.otpCode),
        },
      },
    });

    return updated;
  }

  /**
   * REGLA INVIOLABLE RN-05:
   * Bloquea el procedimiento en estado 'Atendido' si el consentimiento informado requerido no está firmado
   */
  async verifyProcedureConsent(clinicalRecordId: string, procedureName: string) {
    const consent = await this.prisma.informedConsent.findFirst({
      where: {
        clinicalRecordId,
        procedureName: { contains: procedureName, mode: 'insensitive' },
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!consent || !consent.isSigned) {
      throw new ForbiddenException({
        errorCode: 'ERR_CONSENT_REQUIRED_NOT_SIGNED',
        detail: `Regla RN-05: No es posible marcar como atendido el procedimiento '${procedureName}' sin contar con el Consentimiento Informado debidamente firmado.`,
      });
    }

    return true;
  }

  /**
   * Obtiene el listado de recetas odontológicas del paciente
   */
  async getPrescriptions(patientId: string) {
    const record = await this.prisma.clinicalRecord.findUnique({
      where: { patientId },
    });

    if (!record || record.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_CLINICAL_RECORD_NOT_FOUND',
        detail: `No se encontró el expediente clínico del paciente ${patientId}`,
      });
    }

    const prescriptions = await this.prisma.prescription.findMany({
      where: {
        clinicalRecordId: record.id,
        isDeleted: false,
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      recordId: record.id,
      patientId,
      totalPrescriptions: prescriptions.length,
      prescriptions,
    };
  }

  /**
   * Emite una receta odontológica electrónica con código QR y verificación cruzada de alergias
   */
  async createPrescription(
    patientId: string,
    dto: CreatePrescriptionDto,
    doctorId?: string,
  ) {
    const record = await this.prisma.clinicalRecord.findUnique({
      where: { patientId },
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

    if (!record || record.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_CLINICAL_RECORD_NOT_FOUND',
        detail: `No se encontró el expediente clínico del paciente ${patientId}`,
      });
    }

    // Verificación cruzada reactiva de alergias
    const visibleAlerts: string[] = Array.isArray(record.visibleAlerts)
      ? (record.visibleAlerts as string[])
      : [];
    const prescribedNames = dto.items.map((i) => i.name.toLowerCase()).join(' ');

    if (!dto.bypassAllergyWarning) {
      if (
        visibleAlerts.includes('ALERGIA_PENICILINA') &&
        (prescribedNames.includes('amoxicilina') ||
          prescribedNames.includes('ampicilina') ||
          prescribedNames.includes('penicilina'))
      ) {
        throw new ConflictException({
          errorCode: 'ERR_ALLERGY_CONFLICT_DETECTED',
          detail:
            'Alerta Crítica: El paciente tiene registrada ALERGIA A LA PENICILINA y se está prescribiendo un betalactámico (Amoxicilina/Ampicilina). Requiere confirmación explícita o cambio a Clindamicina/Azitromicina.',
          alertTriggered: 'ALERGIA_PENICILINA',
        });
      }

      if (
        visibleAlerts.includes('ALERGIA_AINES') &&
        (prescribedNames.includes('ibuprofeno') ||
          prescribedNames.includes('ketorolaco') ||
          prescribedNames.includes('diclofenaco') ||
          prescribedNames.includes('naproxeno'))
      ) {
        throw new ConflictException({
          errorCode: 'ERR_ALLERGY_CONFLICT_DETECTED',
          detail:
            'Alerta Crítica: El paciente tiene registrada ALERGIA A AINES y se está prescribiendo un analgésico antiinflamatorio no esteroideo. Requiere confirmación explícita o cambio a Paracetamol/Tramadol.',
          alertTriggered: 'ALERGIA_AINES',
        });
      }
    }

    // Generar código único criptográfico para el QR de verificación farmacéutica
    const qrVerificationCode = `SIGO-RX-${Date.now().toString(36).toUpperCase()}-${createHash('sha256')
      .update(`${record.id}|${Date.now()}|${doctorId}`)
      .digest('hex')
      .substring(0, 12)
      .toUpperCase()}`;

    const prescription = await this.prisma.prescription.create({
      data: {
        clinicalRecordId: record.id,
        doctorId: doctorId || '00000000-0000-0000-0000-000000000001',
        items: dto.items as any,
        instructions: dto.instructions,
        qrVerificationCode,
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Auditoría forense
    await this.prisma.auditLog.create({
      data: {
        userId: doctorId,
        action: 'CREATE',
        resource: 'prescriptions',
        resourceId: prescription.id,
        metadata: {
          action: 'CREATE_PRESCRIPTION',
          qrVerificationCode,
          itemsCount: dto.items.length,
          bypassAllergyWarning: Boolean(dto.bypassAllergyWarning),
        },
      },
    });

    return prescription;
  }

  /**
   * Endpoint de Verificación Pública de Receta Odontológica Electrónica vía QR
   */
  async verifyPublicPrescription(qrCode: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        qrVerificationCode: qrCode,
        isDeleted: false,
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        clinicalRecord: {
          include: {
            patient: {
              select: {
                firstName: true,
                lastName: true,
                documentType: true,
                documentNumber: true,
              },
            },
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException({
        errorCode: 'ERR_PRESCRIPTION_NOT_FOUND',
        detail: `No se encontró una receta electrónica válida con el código de verificación provisto: ${qrCode}`,
      });
    }

    return {
      isValid: true,
      qrVerificationCode: prescription.qrVerificationCode,
      issuedAt: prescription.createdAt,
      doctor: {
        fullName: `Dr(a). ${prescription.doctor.firstName} ${prescription.doctor.lastName}`,
        email: prescription.doctor.email,
      },
      patient: {
        fullName: `${prescription.clinicalRecord.patient.firstName} ${prescription.clinicalRecord.patient.lastName}`,
        document: `${prescription.clinicalRecord.patient.documentType} ${prescription.clinicalRecord.patient.documentNumber}`,
      },
      items: prescription.items,
      instructions: prescription.instructions,
      clinic: 'SIGO-Dental Red Odontológica',
      verificationTimestamp: new Date(),
    };
  }
}



