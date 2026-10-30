import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ConsentManager } from './ConsentManager';
import { clinicalRecordsApi } from '../../services/clinicalRecordsApi';

vi.mock('../../services/clinicalRecordsApi', () => ({
  clinicalRecordsApi: {
    getConsents: vi.fn(),
    createConsent: vi.fn(),
    signConsent: vi.fn(),
  },
}));

describe('ConsentManager Component', () => {
  const mockConsents = [
    {
      id: 'consent-1',
      clinicalRecordId: 'cr-1',
      procedureName: 'Exodoncia de tercer molar',
      risksDescription: 'Riesgos de inflamación y parestesia temporal',
      isSigned: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'consent-2',
      clinicalRecordId: 'cr-1',
      procedureName: 'Tratamiento de Conductos',
      risksDescription: 'Riesgos de sobreobturación o dolor periapical',
      isSigned: true,
      signedAt: new Date().toISOString(),
      documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (clinicalRecordsApi.getConsents as any).mockResolvedValue({
      totalConsents: 2,
      consents: mockConsents,
    });
  });

  it('debe listar los consentimientos informados con sus estados Pendiente y Firmado', async () => {
    render(
      <ConsentManager
        patientId="00000000-0000-0000-0000-000000000001"
        patientName="Carlos Ramos"
        canWrite={true}
      />,
    );

    expect(screen.getByText('Consentimientos Informados Digitales')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Exodoncia de tercer molar')).toBeDefined();
      expect(screen.getByText('Tratamiento de Conductos')).toBeDefined();
      expect(screen.getByText('Pendiente')).toBeDefined();
      expect(screen.getByText('Firmado')).toBeDefined();
      expect(screen.getByText(/SHA-256:/)).toBeDefined();
    });
  });

  it('debe abrir el modal de nuevo consentimiento al pulsar Nuevo Consentimiento', () => {
    render(
      <ConsentManager
        patientId="00000000-0000-0000-0000-000000000001"
        canWrite={true}
      />,
    );

    const newBtn = screen.getByText('Nuevo Consentimiento');
    fireEvent.click(newBtn);

    expect(screen.getByText('Generar Consentimiento Informado')).toBeDefined();
    expect(screen.getByText('Declaración de Riesgos y Alternativas Terapéuticas')).toBeDefined();
  });

  it('debe respetar permisos RBAC ocultando botones de acción cuando canWrite es false', () => {
    render(
      <ConsentManager
        patientId="00000000-0000-0000-0000-000000000001"
        canWrite={false}
      />,
    );

    expect(screen.queryByText('Nuevo Consentimiento')).toBeNull();
    expect(screen.queryByText('Firmar en Pantalla')).toBeNull();
  });
});

