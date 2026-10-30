import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BatchExpiryTracker } from './BatchExpiryTracker';
import { inventoryApi } from '../../services/inventoryApi';
import { ExpiringBatchItem } from '../../types/inventory.types';

vi.mock('../../services/inventoryApi');

const mockExpiringBatches: ExpiringBatchItem[] = [
  {
    id: 'b-1',
    supplyId: 's-1',
    supplyName: 'Anestesia Lidocaína 2%',
    supplySku: 'INS-001',
    unit: 'CARPULE',
    batchNumber: 'LID-2026-X',
    availableQuantity: 15,
    expirationDate: '2026-11-05',
    daysRemaining: 6,
    alertLevel: 'URGENTE_15_DIAS',
  },
  {
    id: 'b-2',
    supplyId: 's-2',
    supplyName: 'Guantes de Nitrilo M',
    supplySku: 'INS-002',
    unit: 'CAJA',
    batchNumber: 'GNT-2025-Z',
    availableQuantity: 4,
    expirationDate: '2026-10-15',
    daysRemaining: -15,
    alertLevel: 'CADUCADO',
  },
];

describe('BatchExpiryTracker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(inventoryApi, 'getExpiringBatches').mockResolvedValue(mockExpiringBatches);
  });

  it('renders expiry tracker title and summaries correctly', async () => {
    render(<BatchExpiryTracker />);

    expect(screen.getByText('Control de Vencimiento de Lotes')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Lotes Caducados')).toBeDefined();
      expect(screen.getByText('Crítico (< 15 días)')).toBeDefined();
      expect(screen.getByText('LID-2026-X')).toBeDefined();
      expect(screen.getByText('GNT-2025-Z')).toBeDefined();
    });
  });

  it('filters batches when clicking filter chips', async () => {
    render(<BatchExpiryTracker />);

    await waitFor(() => {
      expect(screen.getByText('LID-2026-X')).toBeDefined();
      expect(screen.getByText('GNT-2025-Z')).toBeDefined();
    });

    const caducadosChip = screen.getByRole('button', { name: /Caducados/i });
    fireEvent.click(caducadosChip);

    await waitFor(() => {
      expect(screen.getByText('GNT-2025-Z')).toBeDefined();
      expect(screen.queryByText('LID-2026-X')).toBeNull();
    });
  });
});

