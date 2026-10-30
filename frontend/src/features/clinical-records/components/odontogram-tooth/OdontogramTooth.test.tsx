import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OdontogramTooth } from './OdontogramTooth';

describe('OdontogramTooth Component', () => {
  it('debe renderizar el número de pieza en notación FDI', () => {
    render(
      <OdontogramTooth
        fdiNumber={18}
        universalLabel="1"
        activeNotation="FDI"
        isUpperArch={true}
      />,
    );

    expect(screen.getByText('18')).toBeDefined();
  });

  it('debe renderizar la notación Universal cuando activeNotation es UNIVERSAL', () => {
    render(
      <OdontogramTooth
        fdiNumber={18}
        universalLabel="1"
        activeNotation="UNIVERSAL"
        isUpperArch={true}
      />,
    );

    expect(screen.getByText('1')).toBeDefined();
  });

  it('debe disparar onSurfaceClick al hacer clic en una superficie dental', () => {
    const handleSurfaceClick = vi.fn();

    render(
      <OdontogramTooth
        fdiNumber={21}
        universalLabel="9"
        activeNotation="FDI"
        isUpperArch={true}
        onSurfaceClick={handleSurfaceClick}
      />,
    );

    const occlusalSurface = screen.getByTestId('surface-21-occlusal');
    fireEvent.click(occlusalSurface);

    expect(handleSurfaceClick).toHaveBeenCalledWith(21, 'occlusal');
  });
});

