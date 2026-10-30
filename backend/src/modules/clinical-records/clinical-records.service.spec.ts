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
});
