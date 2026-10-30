import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { TreatmentPlansCommissionsView } from './TreatmentPlansCommissionsView';

vi.mock('../treatment-plan-builder', () => ({
  TreatmentPlanBuilder: () => <div>Mock Treatment Plan Builder</div>,
}));

vi.mock('../doctor-settlement-manager', () => ({
  DoctorSettlementManager: () => <div>Mock Doctor Settlement Manager</div>,
}));

describe('TreatmentPlansCommissionsView Component', () => {
  it('renders tabs and defaults to Presupuestos tab', () => {
    render(<TreatmentPlansCommissionsView />);

    expect(
      screen.getByText('Presupuestos Clínicos y Liquidación de Honorarios'),
    ).toBeDefined();
    expect(screen.getByText('Mock Treatment Plan Builder')).toBeDefined();
  });

  it('switches to Liquidación de Honorarios tab on click', () => {
    render(<TreatmentPlansCommissionsView />);

    const settlementsTab = screen.getByRole('tab', {
      name: /Liquidación de Honorarios/i,
    });
    fireEvent.click(settlementsTab);

    expect(screen.getByText('Mock Doctor Settlement Manager')).toBeDefined();
  });
});

