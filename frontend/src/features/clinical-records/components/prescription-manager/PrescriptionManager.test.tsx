import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { PrescriptionManager } from './PrescriptionManager';
import { clinicalRecordsApi } from '../../services/clinicalRecordsApi';

vi.mock('../../services/clinicalRecordsApi', () => ({
  clinicalRecordsApi: {
    getPrescriptions: vi.fn(),
    createPrescription: vi.fn(),
  },
}));

describe('PrescriptionManager Component', () => {
  const mockPrescriptions = [
    {
      id: 'rx-1',
      clinicalRecordId: 'cr-1',
      doctorId: 'doc-1',
      doctor: { firstName: 'Mario', lastName: 'Salas', email: 'mario@sigo.test' },
      items: [
        {
          name: 'Amoxicilina 500mg',
          dose: '500 mg',
          frequency: 'Cada 8 horas',
          duration: 'Por 7 días',
          indications: 'Tomar con agua',
        },
      ],
      instructions: 'Evitar alimentos calientes',
      qrVerificationCode: 'SIGO-RX-TEST123456',
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (clinicalRecordsApi.getPrescriptions as any).mockResolvedValue({
      totalPrescriptions: 1,
      prescriptions: mockPrescriptions,
    });
  });

  it('debe listar las recetas odontológicas con su código QR de verificación', async () => {
    render(
      <PrescriptionManager
        patientId="00000000-0000-0000-0000-000000000001"
        patientName="Laura Gómez"
        canWrite={true}
      />,
    );

    expect(screen.getByText('Recetario Odontológico Electrónico')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Amoxicilina 500mg')).toBeDefined();
      expect(screen.getByText('SIGO-RX-TEST123456')).toBeDefined();
    });
  });

  it('debe abrir el modal para emitir receta al pulsar Emitir Nueva Receta', () => {
    render(
      <PrescriptionManager
        patientId="00000000-0000-0000-0000-000000000001"
        canWrite={true}
      />,
    );

    const btn = screen.getByText('Emitir Nueva Receta');
    fireEvent.click(btn);

    expect(screen.getByText('Emitir Receta Odontológica Electrónica')).toBeDefined();
    expect(screen.getByText('Fármacos Frecuentes en Odontología:')).toBeDefined();
  });

  it('debe respetar los permisos RBAC ocultando el botón Emitir Nueva Receta cuando canWrite es false', () => {
    render(
      <PrescriptionManager
        patientId="00000000-0000-0000-0000-000000000001"
        canWrite={false}
      />,
    );

    expect(screen.queryByText('Emitir Nueva Receta')).toBeNull();
  });
});

