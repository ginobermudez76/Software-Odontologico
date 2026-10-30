import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { ProcedureRecipeConfig } from './ProcedureRecipeConfig';
import { inventoryApi } from '../../services/inventoryApi';

vi.mock('../../services/inventoryApi');

const mockSupplies = [
  {
    id: 'sup-1',
    sku: 'INS-001',
    name: 'Anestesia Lidocaína 2%',
    brand: 'NewStetic',
    unit: 'CARPULE',
    minStock: 20,
    currentStock: 50,
    stockStatus: 'OPTIMO' as const,
    activeBatchesCount: 1,
    nextExpiringBatch: null,
    nextExpirationDays: null,
    updatedAt: new Date().toISOString(),
  },
];

const mockRecipe = {
  procedureId: 'proc-1',
  items: [
    {
      supplyId: 'sup-1',
      supplyName: 'Anestesia Lidocaína 2%',
      supplySku: 'INS-001',
      unit: 'CARPULE',
      quantity: 1,
    },
  ],
};

describe('ProcedureRecipeConfig Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(inventoryApi, 'getSupplies').mockResolvedValue(mockSupplies);
    vi.spyOn(inventoryApi, 'getProcedureRecipe').mockResolvedValue(mockRecipe);
    vi.spyOn(inventoryApi, 'configureProcedureRecipe').mockResolvedValue({ success: true });
  });

  it('renders procedure selector and recipe items', async () => {
    render(<ProcedureRecipeConfig canWrite={true} />);

    expect(screen.getByText('Recetas Clínicas y Descargo por Procedimiento')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Anestesia Lidocaína 2%')).toBeDefined();
    });
  });

  it('hides add and save buttons when canWrite is false (RBAC check)', async () => {
    render(<ProcedureRecipeConfig canWrite={false} />);

    await waitFor(() => {
      expect(screen.getByText('Anestesia Lidocaína 2%')).toBeDefined();
    });

    expect(screen.queryByText('Agregar a Receta')).toBeNull();
    expect(screen.queryByText('Guardar Receta Clínica')).toBeNull();
  });

  it('allows saving recipe when clicking Guardar Receta Clínica', async () => {
    render(<ProcedureRecipeConfig canWrite={true} />);

    await waitFor(() => {
      expect(screen.getByText('Anestesia Lidocaína 2%')).toBeDefined();
    });

    const saveButton = screen.getByText('Guardar Receta Clínica');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText('Receta clínica y descargo estándar guardados exitosamente'),
      ).toBeDefined();
    });
  });
});
