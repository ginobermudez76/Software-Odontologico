import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SignaturePad } from './SignaturePad';

describe('SignaturePad Component', () => {
  it('debe renderizar el lienzo de captura de firma biométrica y el botón de borrado', () => {
    render(<SignaturePad title="Firma de Prueba" />);

    expect(screen.getByText('Firma de Prueba')).toBeDefined();
    expect(screen.getByText('Borrar Trazo')).toBeDefined();
    expect(screen.getByLabelText('Lienzo de captura de firma biométrica')).toBeDefined();
  });

  it('debe deshabilitar el botón de borrado cuando no hay trazo dibujado', () => {
    render(<SignaturePad />);
    const clearButton = screen.getByText('Borrar Trazo').closest('button');
    expect(clearButton?.disabled).toBe(true);
  });
});
