import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SoepEditor } from './SoepEditor';
import { clinicalRecordsApi } from '../../services/clinicalRecordsApi';

vi.mock('../../services/clinicalRecordsApi', () => ({
  clinicalRecordsApi: {
    getEvolutionNotes: vi.fn(),
    createEvolutionNote: vi.fn(),
    updateEvolutionNote: vi.fn(),
    createAdenda: vi.fn(),
  },
}));

describe('SoepEditor Component', () => {
  const mockNotes = [
    {
      id: 'note-recent-1',
      clinicalRecordId: 'cr-1',
      doctorId: 'doc-1',
      doctor: { id: 'doc-1', firstName: 'Elena', lastName: 'Ríos', email: 'elena@sigo.test' },
      subjective: 'Paciente con dolor en 16',
      objective: 'Caries oclusal profunda',
      assessment: 'K04.0 Pulpitis reversible',
      plan: 'Aislamiento y restauración',
      isLocked: false,
      isEditable: true,
      remainingHoursToEdit: 22.5,
      isAdenda: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adendas: [],
    },
    {
      id: 'note-old-2',
      clinicalRecordId: 'cr-1',
      doctorId: 'doc-1',
      doctor: { id: 'doc-1', firstName: 'Elena', lastName: 'Ríos', email: 'elena@sigo.test' },
      subjective: 'Limpieza dental de rutina',
      objective: 'Cálculo supragingival generalizado',
      assessment: 'K05.1 Gingivitis crónica',
      plan: 'Profilaxis y destartraje ultrasónico',
      isLocked: true,
      isEditable: false,
      remainingHoursToEdit: 0,
      isAdenda: false,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      adendas: [
        {
          id: 'adenda-1',
          doctorId: 'doc-1',
          doctor: { id: 'doc-1', firstName: 'Elena', lastName: 'Ríos', email: 'elena@sigo.test' },
          clarificationText: 'Se entregó colutorio de clorhexidina al 0.12% complementario.',
          subjective: 'ADENDA MÉDICA: Aclaración posológica',
          createdAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (clinicalRecordsApi.getEvolutionNotes as any).mockResolvedValue({
      recordId: 'cr-1',
      patientId: 'p-1',
      totalNotes: 2,
      notes: mockNotes,
    });
  });

  it('debe renderizar el formulario SOEP y los botones de acceso rápido CIE-10', async () => {
    render(
      <SoepEditor
        patientId="00000000-0000-0000-0000-000000000001"
        patientName="Elena Ríos"
        canWrite={true}
      />,
    );

    expect(screen.getByText('Nueva Nota de Evolución Médica (Formato SOEP)')).toBeDefined();
    expect(screen.getByLabelText(/Subjetivo/i)).toBeDefined();
    expect(screen.getByLabelText(/Objetivo/i)).toBeDefined();
    expect(screen.getByLabelText(/Evaluación/i)).toBeDefined();
    expect(screen.getByLabelText(/Plan/i)).toBeDefined();
    expect(screen.getByText('+ K02.1 Caries de la dentina')).toBeDefined();
    expect(screen.getByText('+ K04.0 Pulpitis reversible / irreversible')).toBeDefined();
  });

  it('debe mostrar las notas históricas con insignias de estado Editable e Inmutable', async () => {
    render(
      <SoepEditor
        patientId="00000000-0000-0000-0000-000000000001"
        canWrite={true}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Editable \(Quedan/)).toBeDefined();
      expect(screen.getByText('Inmutable (24h Cumplidas)')).toBeDefined();
    });

    // La nota antigua debe tener su adenda visible
    expect(screen.getByText(/Se entregó colutorio de clorhexidina/)).toBeDefined();
  });

  it('debe abrir el modal de adenda aclaratoria al pulsar Añadir Adenda', async () => {
    render(
      <SoepEditor
        patientId="00000000-0000-0000-0000-000000000001"
        canWrite={true}
      />,
    );

    await waitFor(() => {
      const addAdendaButtons = screen.getAllByText('Añadir Adenda / Aclaratoria');
      expect(addAdendaButtons.length).toBeGreaterThan(0);
      fireEvent.click(addAdendaButtons[0]);
    });

    expect(screen.getByText('Emitir Nota de Adenda / Aclaratoria')).toBeDefined();
    expect(screen.getByText('Firmar y Registrar Adenda')).toBeDefined();
  });

  it('debe respetar los permisos RBAC ocultando el formulario y botones cuando canWrite es false', async () => {
    render(
      <SoepEditor
        patientId="00000000-0000-0000-0000-000000000001"
        canWrite={false}
      />,
    );

    expect(screen.queryByText('Registrar Nota SOEP')).toBeNull();
    expect(screen.queryByText('Añadir Adenda / Aclaratoria')).toBeNull();
  });
});
