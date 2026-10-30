import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClinicalRecordsService } from './clinical-records.service';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';

describe('ClinicalRecordsService', () => {
  let service: ClinicalRecordsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      clinicalRecord: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      evolutionNote: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      informedConsent: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      prescription: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-log-1' }),
      },
    };

    service = new ClinicalRecordsService(mockPrisma);
  });

  it('debe lanzar NotFoundException si el expediente del paciente no existe', async () => {
    mockPrisma.clinicalRecord.findUnique.mockResolvedValueOnce(null);

    await expect(service.getOdontogram('00000000-0000-0000-0000-000000000099')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debe retornar el odontograma inicial y evolutivo del paciente', async () => {
    const mockRecord = {
      id: 'cr-1',
      recordNumber: 'EXP-2026-00001',
      patient: { id: 'p-1', firstName: 'Laura', lastName: 'Gómez', birthDate: new Date('1995-04-12') },
      visibleAlerts: ['ALERGIA_PENICILINA'],
      initialOdontogram: { '18': { toothId: '18', state: 'CARIES' } },
      evolutionaryOdontogram: { '18': { toothId: '18', state: 'RESTORATION' } },
      updatedAt: new Date(),
      isDeleted: false,
    };

    mockPrisma.clinicalRecord.findUnique.mockResolvedValueOnce(mockRecord);

    const result = await service.getOdontogram('p-1');
    expect(result.recordNumber).toBe('EXP-2026-00001');
    expect(result.initialOdontogram['18'].state).toBe('CARIES');
    expect(result.evolutionaryOdontogram['18'].state).toBe('RESTORATION');
  });

  it('debe actualizar el odontograma evolutivo y registrar auditoría', async () => {
    mockPrisma.clinicalRecord.findUnique.mockResolvedValueOnce({
      id: 'cr-1',
      evolutionaryOdontogram: {},
      isDeleted: false,
    });

    mockPrisma.clinicalRecord.update.mockResolvedValueOnce({
      id: 'cr-1',
      recordNumber: 'EXP-2026-00001',
      initialOdontogram: {},
      evolutionaryOdontogram: {
        '21': { toothId: '21', state: 'CARIES', surfaces: { mesial: 'CARIES' } },
      },
      updatedAt: new Date(),
    });

    const result = await service.updateOdontogram(
      'p-1',
      {
        mode: 'EVOLUTIONARY',
        teeth: {
          '21': { toothId: '21', state: 'CARIES', surfaces: { mesial: 'CARIES' } },
        },
        generalNotes: 'Caries activa detectada en 21M',
      },
      'doc-1',
    );

    expect(result.modeUpdated).toBe('EVOLUTIONARY');
    expect(mockPrisma.clinicalRecord.update).toHaveBeenCalled();
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  describe('Periodontograma & Cálculo de NIC', () => {
    it('debe calcular correctamente el NIC = PS + MG tanto con recesión (+) como agrandamiento (-)', () => {
      const teethInput: any = {
        '16': {
          toothNumber: 16,
          vestibular: {
            distal: { probingDepth: 4, gingivalMargin: 2, bleeding: true, plaque: true }, // NIC = 6 (bolsa)
            middle: { probingDepth: 5, gingivalMargin: -2, bleeding: false, plaque: false }, // NIC = 3 (pseudobolsa)
            mesial: { probingDepth: 3, gingivalMargin: 0, bleeding: false, plaque: true }, // NIC = 3
          },
          lingual: {
            distal: { probingDepth: 6, gingivalMargin: 1, bleeding: true, plaque: true }, // NIC = 7 (bolsa profunda)
            middle: { probingDepth: 2, gingivalMargin: 0, bleeding: false, plaque: false }, // NIC = 2
            mesial: { probingDepth: 3, gingivalMargin: 0, bleeding: false, plaque: false }, // NIC = 3
          },
        },
      };

      const result = service.calculatePeriodontogramMetrics(teethInput, 'Evaluación cuadrante 1');

      // Verificación de NIC por sitio
      const tooth16 = result.teeth['16'];
      expect(tooth16.vestibular.distal.clinicalAttachmentLevel).toBe(6); // 4 + 2
      expect(tooth16.vestibular.middle.clinicalAttachmentLevel).toBe(3); // 5 + (-2)
      expect(tooth16.vestibular.mesial.clinicalAttachmentLevel).toBe(3); // 3 + 0
      expect(tooth16.lingual.distal.clinicalAttachmentLevel).toBe(7); // 6 + 1

      // Verificación de métricas globales:
      // Total sitios = 6
      // Sitios con sangrado = 2 (distal-V, distal-L) -> 2/6 = 33.3%
      // Sitios con placa = 3 (distal-V, mesial-V, distal-L) -> 3/6 = 50.0%
      // Bolsas periodontales (PS >= 4) = 3 (4mm, 5mm, 6mm)
      // Bolsas profundas (PS >= 6) = 1 (6mm)
      expect(result.summary.evaluatedTeethCount).toBe(1);
      expect(result.summary.bleedingOnProbingIndex).toBe(33.3);
      expect(result.summary.olearyPlaqueIndex).toBe(50.0);
      expect(result.summary.periodontalPocketsCount).toBe(3);
      expect(result.summary.deepPocketsCount).toBe(1);
    });

    it('debe excluir del conteo los dientes ausentes (isMissing)', () => {
      const teethInput: any = {
        '18': {
          toothNumber: 18,
          isMissing: true,
          vestibular: {
            distal: { probingDepth: 0, gingivalMargin: 0 },
            middle: { probingDepth: 0, gingivalMargin: 0 },
            mesial: { probingDepth: 0, gingivalMargin: 0 },
          },
          lingual: {
            distal: { probingDepth: 0, gingivalMargin: 0 },
            middle: { probingDepth: 0, gingivalMargin: 0 },
            mesial: { probingDepth: 0, gingivalMargin: 0 },
          },
        },
      };

      const result = service.calculatePeriodontogramMetrics(teethInput);
      expect(result.summary.evaluatedTeethCount).toBe(0);
      expect(result.summary.bleedingOnProbingIndex).toBe(0);
      expect(result.summary.olearyPlaqueIndex).toBe(0);
      expect(result.summary.periodontalPocketsCount).toBe(0);
    });

    it('debe persistir el periodontograma y generar registro de auditoría', async () => {
      mockPrisma.clinicalRecord.findUnique.mockResolvedValueOnce({
        id: 'cr-1',
        isDeleted: false,
      });

      mockPrisma.clinicalRecord.update.mockResolvedValueOnce({
        id: 'cr-1',
        recordNumber: 'EXP-2026-00001',
        periodontogramData: {},
        updatedAt: new Date(),
      });

      const result = await service.updatePeriodontogram(
        'p-1',
        {
          teeth: {
            '11': {
              toothNumber: 11,
              vestibular: {
                distal: { probingDepth: 2, gingivalMargin: 0 },
                middle: { probingDepth: 2, gingivalMargin: 0 },
                mesial: { probingDepth: 2, gingivalMargin: 0 },
              },
              lingual: {
                distal: { probingDepth: 2, gingivalMargin: 0 },
                middle: { probingDepth: 2, gingivalMargin: 0 },
                mesial: { probingDepth: 2, gingivalMargin: 0 },
              },
            },
          },
        },
        'doc-1',
      );

      expect(result.recordId).toBe('cr-1');
      expect(result.periodontogram.summary.evaluatedTeethCount).toBe(1);
      expect(mockPrisma.clinicalRecord.update).toHaveBeenCalled();
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'UPDATE',
            metadata: expect.objectContaining({
              action: 'UPDATE_PERIODONTOGRAM',
            }),
          }),
        }),
      );
    });
  });

  describe('Notas de Evolución SOEP & Regla Inviolable de 24 Horas', () => {
    it('debe crear una nueva nota clínica SOEP con cálculo de 24 horas de edición restante', async () => {
      mockPrisma.clinicalRecord.findUnique.mockResolvedValueOnce({
        id: 'cr-1',
        isDeleted: false,
      });

      const noteMock = {
        id: 'note-1',
        clinicalRecordId: 'cr-1',
        doctorId: 'doc-1',
        subjective: 'Dolor en cuadrante 1 ante frío',
        objective: 'Cavitación en pieza 16',
        assessment: 'K04.0 Pulpitis reversible',
        plan: 'Aislamiento, remoción de caries y base cavitaria',
        isLocked: false,
        isAdenda: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        doctor: { id: 'doc-1', firstName: 'Mario', lastName: 'Salas', email: 'doc@sigo.test' },
      };

      mockPrisma.evolutionNote.create.mockResolvedValueOnce(noteMock);

      const result = await service.createEvolutionNote(
        'p-1',
        {
          subjective: noteMock.subjective,
          objective: noteMock.objective,
          assessment: noteMock.assessment,
          plan: noteMock.plan,
        },
        'doc-1',
      );

      expect(result.id).toBe('note-1');
      expect(result.isEditable).toBe(true);
      expect(result.remainingHoursToEdit).toBe(24);
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('debe permitir la edición de la nota SOEP si han pasado MENOS de 24 horas', async () => {
      // Nota creada hace 2 horas
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      mockPrisma.evolutionNote.findUnique.mockResolvedValueOnce({
        id: 'note-1',
        isLocked: false,
        isDeleted: false,
        createdAt: twoHoursAgo,
      });

      mockPrisma.evolutionNote.update.mockResolvedValueOnce({
        id: 'note-1',
        subjective: 'Dolor mitigado',
        objective: 'Pieza 16 restaurada',
        assessment: 'K04.0 Pulpitis en resolución',
        plan: 'Control en 15 días',
        createdAt: twoHoursAgo,
        doctor: { id: 'doc-1', firstName: 'Mario', lastName: 'Salas' },
      });

      const result = await service.updateEvolutionNote(
        'note-1',
        {
          subjective: 'Dolor mitigado',
          objective: 'Pieza 16 restaurada',
          assessment: 'K04.0 Pulpitis en resolución',
          plan: 'Control en 15 días',
        },
        'doc-1',
      );

      expect(result.isEditable).toBe(true);
      expect(result.remainingHoursToEdit).toBeCloseTo(22, 0);
      expect(mockPrisma.evolutionNote.update).toHaveBeenCalled();
    });

    it('REGLA INVIOLABLE RN-01: debe lanzar ForbiddenException (HTTP 403) si han pasado MÁS de 24 horas', async () => {
      // Nota creada hace 25 horas
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);

      mockPrisma.evolutionNote.findUnique.mockResolvedValueOnce({
        id: 'note-locked',
        isLocked: false,
        isDeleted: false,
        createdAt: twentyFiveHoursAgo,
      });

      await expect(
        service.updateEvolutionNote(
          'note-locked',
          {
            subjective: 'Intento de modificar nota antigua',
            objective: 'Test',
            assessment: 'Test',
            plan: 'Test',
          },
          'doc-1',
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.evolutionNote.update).not.toHaveBeenCalled();
    });

    it('debe crear una Nota de Adenda / Aclaratoria vinculada a la nota histórica inmutable', async () => {
      const originalNoteMock = {
        id: 'note-orig-1',
        clinicalRecordId: 'cr-1',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 horas atrás
        isDeleted: false,
      };

      mockPrisma.evolutionNote.findUnique.mockResolvedValueOnce(originalNoteMock);

      const adendaMock = {
        id: 'adenda-1',
        originalNoteId: 'note-orig-1',
        doctorId: 'doc-1',
        assessment: 'Aclaratoria sobre prueba pulpar complementaria con respuesta adecuada.',
        subjective: 'ADENDA MÉDICA: Aclaración de diagnóstico',
        createdAt: new Date(),
        doctor: { id: 'doc-1', firstName: 'Mario', lastName: 'Salas' },
      };

      mockPrisma.evolutionNote.create.mockResolvedValueOnce(adendaMock);

      const result = await service.createAdenda(
        'note-orig-1',
        {
          clarificationText: 'Aclaratoria sobre prueba pulpar complementaria con respuesta adecuada.',
          reason: 'Aclaración de diagnóstico',
        },
        'doc-1',
      );

      expect(result.id).toBe('adenda-1');
      expect(result.originalNoteId).toBe('note-orig-1');
      expect(mockPrisma.evolutionNote.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isAdenda: true,
            isLocked: true,
            originalNoteId: 'note-orig-1',
          }),
        }),
      );
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('Consentimiento Informado Digital & Regla RN-05', () => {
    it('debe firmar el consentimiento generando hash SHA-256 e IP', async () => {
      mockPrisma.informedConsent.findUnique.mockResolvedValueOnce({
        id: 'consent-1',
        procedureName: 'Exodoncia de pieza 38',
        risksDescription: 'Riesgos de parestesia y hemorragia',
        isSigned: false,
        isDeleted: false,
      });

      mockPrisma.informedConsent.update.mockResolvedValueOnce({
        id: 'consent-1',
        procedureName: 'Exodoncia de pieza 38',
        isSigned: true,
        documentHash: 'a1b2c3d4e5f6',
        signerIp: '190.152.12.84',
      });

      const result = await service.signConsent(
        'consent-1',
        {
          signatureData: 'data:image/svg+xml;base64,mockvector',
          signerIp: '190.152.12.84',
        },
      );

      expect(result.isSigned).toBe(true);
      expect(mockPrisma.informedConsent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isSigned: true,
            signerIp: '190.152.12.84',
            documentHash: expect.any(String),
          }),
        }),
      );
    });

    it('debe rechazar volver a firmar un consentimiento ya firmado (Conflicto)', async () => {
      mockPrisma.informedConsent.findUnique.mockResolvedValueOnce({
        id: 'consent-signed',
        isSigned: true,
        isDeleted: false,
      });

      await expect(
        service.signConsent('consent-signed', { signatureData: 'test' }),
      ).rejects.toThrow(ConflictException);
    });

    it('REGLA INVIOLABLE RN-05: debe bloquear el procedimiento si el consentimiento requerido NO está firmado', async () => {
      // Caso 1: No existe consentimiento
      mockPrisma.informedConsent.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.verifyProcedureConsent('cr-1', 'Exodoncia quirúrgica'),
      ).rejects.toThrow(ForbiddenException);

      // Caso 2: Existe pero no está firmado (isSigned: false)
      mockPrisma.informedConsent.findFirst.mockResolvedValueOnce({
        id: 'consent-unsign',
        procedureName: 'Exodoncia quirúrgica',
        isSigned: false,
      });

      await expect(
        service.verifyProcedureConsent('cr-1', 'Exodoncia quirúrgica'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('REGLA INVIOLABLE RN-05: debe autorizar el procedimiento si el consentimiento está firmado', async () => {
      mockPrisma.informedConsent.findFirst.mockResolvedValueOnce({
        id: 'consent-ok',
        procedureName: 'Exodoncia quirúrgica',
        isSigned: true,
      });

      const ok = await service.verifyProcedureConsent('cr-1', 'Exodoncia quirúrgica');
      expect(ok).toBe(true);
    });
  });

  describe('Recetario Odontológico Electrónico con QR & Alergias', () => {
    it('debe DETECTAR CONFLICTO DE ALERGIA y lanzar ConflictException si se prescribe Amoxicilina a paciente con ALERGIA_PENICILINA', async () => {
      mockPrisma.clinicalRecord.findUnique.mockResolvedValueOnce({
        id: 'cr-1',
        visibleAlerts: ['ALERGIA_PENICILINA'],
        isDeleted: false,
      });

      await expect(
        service.createPrescription(
          'p-1',
          {
            items: [
              {
                name: 'Amoxicilina 500mg',
                dose: '500 mg',
                frequency: 'Cada 8 horas',
                duration: 'Por 7 días',
              },
            ],
            bypassAllergyWarning: false,
          },
          'doc-1',
        ),
      ).rejects.toThrow(ConflictException);

      expect(mockPrisma.prescription.create).not.toHaveBeenCalled();
    });

    it('debe permitir la emisión si el clínico confirma la prescripción (bypassAllergyWarning = true)', async () => {
      mockPrisma.clinicalRecord.findUnique.mockResolvedValueOnce({
        id: 'cr-1',
        visibleAlerts: ['ALERGIA_PENICILINA'],
        isDeleted: false,
      });

      mockPrisma.prescription.create.mockResolvedValueOnce({
        id: 'rx-1',
        qrVerificationCode: 'SIGO-RX-ABCDEF',
        items: [{ name: 'Amoxicilina 500mg' }],
      });

      const result = await service.createPrescription(
        'p-1',
        {
          items: [
            {
              name: 'Amoxicilina 500mg',
              dose: '500 mg',
              frequency: 'Cada 8 horas',
              duration: 'Por 7 días',
            },
          ],
          bypassAllergyWarning: true,
        },
        'doc-1',
      );

      expect(result.id).toBe('rx-1');
      expect(mockPrisma.prescription.create).toHaveBeenCalled();
    });

    it('debe verificar la autenticidad pública de la receta mediante código QR', async () => {
      mockPrisma.prescription.findFirst.mockResolvedValueOnce({
        id: 'rx-1',
        qrVerificationCode: 'SIGO-RX-123456',
        createdAt: new Date(),
        doctor: { firstName: 'Mario', lastName: 'Salas', email: 'mario@sigo.test' },
        clinicalRecord: {
          patient: {
            firstName: 'Carlos',
            lastName: 'Ramos',
            documentType: 'DNI',
            documentNumber: '1723456789',
          },
        },
        items: [{ name: 'Paracetamol 500mg', dose: '500mg' }],
        instructions: 'Tomar cada 8 horas en caso de dolor',
      });

      const result = await service.verifyPublicPrescription('SIGO-RX-123456');

      expect(result.isValid).toBe(true);
      expect(result.qrVerificationCode).toBe('SIGO-RX-123456');
      expect(result.doctor.fullName).toBe('Dr(a). Mario Salas');
      expect(result.patient.fullName).toBe('Carlos Ramos');
    });
  });
});


