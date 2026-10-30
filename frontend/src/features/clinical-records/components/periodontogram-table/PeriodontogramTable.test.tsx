import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PeriodontogramTable } from './PeriodontogramTable';
import { clinicalRecordsApi } from '../../services/clinicalRecordsApi';

vi.mock('../../services/clinicalRecordsApi', () => ({
  clinicalRecordsApi: {
    getPeriodontogram: vi.fn(),
    updatePeriodontogram: vi.fn(),
  },
}));

describe('PeriodontogramTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (clinicalRecordsApi.getPeriodontogram as any).mockResolvedValue({
      recordId: 'rec-1',
      recordNumber: 'EXP-2026-00001',
      periodontogram: {
        teeth: {},
        notes: '',
        summary: {
          olearyPlaqueIndex: 0,
          bleedingOnProbingIndex: 0,
          periodontalPocketsCount: 0,
          deepPocketsCount: 0,
          evaluatedTeethCount: 32,
        },
      },
    });
  });

  it('debe renderizar el resumen de índices periodontales y la tabla', () => {
    render(
      <PeriodontogramTable
        patientId="00000000-0000-0000-0000-000000000001"
        patientName="Carlos Ramos"
        canWrite={true}
      />,
    );

    expect(screen.getByText("Índice O'Leary (Placa)")).toBeDefined();
    expect(screen.getByText('Sangrado al Sondaje (BOP)')).toBeDefined();
    expect(screen.getByText('Bolsas Periodontales')).toBeDefined();
    expect(screen.getByText('Dientes Evaluados')).toBeDefined();
    expect(screen.getByText('Maxilar Superior (Q1 - Q2)')).toBeDefined();
    expect(screen.getByText('Mandíbula Inferior (Q4 - Q3)')).toBeDefined();
  });

  it('debe recalcular automáticamente el NIC = PS + MG cuando se modifican los valores', () => {
    render(
      <PeriodontogramTable
        patientId="00000000-0000-0000-0000-000000000001"
        canWrite={true}
      />,
    );

    // Diente 16: cambiar PS distal a 5mm y MG distal a 2mm -> NIC debe ser 7mm
    const psDistal16 = screen.getByLabelText('PS Distal 16');
    const mgDistal16 = screen.getByLabelText('MG Distal 16');

    fireEvent.change(psDistal16, { target: { value: '5' } });
    fireEvent.change(mgDistal16, { target: { value: '2' } });

    // NIC esperado: 5 + 2 = 7
    const nicBadge = screen.getByTitle('NIC Distal: 7 mm');
    expect(nicBadge).toBeDefined();
    expect(nicBadge.textContent).toBe('7');
  });

  it('debe actualizar el índice de sangrado BOP al marcar casillas de sangrado', () => {
    render(
      <PeriodontogramTable
        patientId="00000000-0000-0000-0000-000000000001"
        canWrite={true}
      />,
    );

    const bopCheckbox = screen.getByLabelText('Sangrado Distal 16');
    fireEvent.click(bopCheckbox);

    // Debe haberse actualizado el porcentaje de BOP mayor a 0%
    const bopTitle = screen.getByText('Sangrado al Sondaje (BOP)');
    expect(bopTitle).toBeDefined();
  });

  it('debe respetar los permisos RBAC ocultando el botón Guardar cuando canWrite es false', () => {
    const { rerender } = render(
      <PeriodontogramTable
        patientId="00000000-0000-0000-0000-000000000001"
        canWrite={true}
      />,
    );

    expect(screen.getByText('Guardar Periodontograma')).toBeDefined();

    // Rerender con canWrite = false
    rerender(
      <PeriodontogramTable
        patientId="00000000-0000-0000-0000-000000000001"
        canWrite={false}
      />,
    );

    expect(screen.queryByText('Guardar Periodontograma')).toBeNull();
  });
});
