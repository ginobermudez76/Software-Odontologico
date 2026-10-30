import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { InventoryList } from './InventoryList';
import * as inventoryApi from '../../services/inventoryApi';
import { StockStatus } from '../../types/inventory.types';

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
    stockStatus: 'OPTIMO' as StockStatus,
    activeBatchesCount: 1,
    nextExpiringBatch: {
      id: 'bat-1',
      batchNumber: 'LID-2026',
      expirationDate: '2027-01-01',
      availableQuantity: 50,
    },
    nextExpirationDays: 200,
    updatedAt: new Date().toISOString(),
  },
];

describe('InventoryList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(inventoryApi.inventoryApi, 'getSupplies').mockResolvedValue(mockSupplies);
  });

  it('renders inventory title and supplies list', async () => {
    render(<InventoryList canWrite={true} />);

    expect(screen.getByText('Inventario Clínico y Almacén')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Anestesia Lidocaína 2%')).toBeDefined();
      expect(screen.getByText('INS-001')).toBeDefined();
      expect(screen.getByText('Óptimo')).toBeDefined();
    });
  });

  it('hides "Nuevo Insumo" button if canWrite is false (RBAC check)', async () => {
    render(<InventoryList canWrite={false} />);

    const newButton = screen.queryByText('Nuevo Insumo');
    expect(newButton).toBeNull();
  });

  it('opens new supply modal when clicking "Nuevo Insumo"', async () => {
    render(<InventoryList canWrite={true} />);

    const newButton = screen.getByText('Nuevo Insumo');
    fireEvent.click(newButton);

    expect(screen.getByText('Registrar Nuevo Insumo Clínico')).toBeDefined();
    expect(screen.getByPlaceholderText('Ej. INS-ANES-01')).toBeDefined();
  });
});
