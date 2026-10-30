import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClinicalRecordsService } from './clinical-records.service';
import { NotFoundException } from '@nestjs/common';

describe('ClinicalRecordsService', () => {
  let service: ClinicalRecordsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      clinicalRecord: {
        findUnique: vi.fn(),
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
});
