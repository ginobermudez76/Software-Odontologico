import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { InventoryView } from './InventoryView';

vi.mock('../inventory-list', () => ({
  InventoryList: () => <div>Mock Inventory List</div>,
}));

vi.mock('../batch-expiry-tracker', () => ({
  BatchExpiryTracker: () => <div>Mock Batch Expiry Tracker</div>,
}));

vi.mock('../procedure-recipe-config', () => ({
  ProcedureRecipeConfig: () => <div>Mock Procedure Recipe Config</div>,
}));

describe('InventoryView Component', () => {
  it('renders tabs and defaults to supplies tab', () => {
    render(<InventoryView />);

    expect(screen.getByText('Gestión de Inventario y Almacén Clínico')).toBeDefined();
    expect(screen.getByText('Mock Inventory List')).toBeDefined();
  });

  it('switches to Caducidades FEFO tab on click', () => {
    render(<InventoryView />);

    const fefoTab = screen.getByRole('tab', { name: /Caducidades FEFO/i });
    fireEvent.click(fefoTab);

    expect(screen.getByText('Mock Batch Expiry Tracker')).toBeDefined();
  });

  it('switches to Recetas de Procedimiento tab on click', () => {
    render(<InventoryView />);

    const recipeTab = screen.getByRole('tab', { name: /Recetas de Procedimiento/i });
    fireEvent.click(recipeTab);

    expect(screen.getByText('Mock Procedure Recipe Config')).toBeDefined();
  });
});
