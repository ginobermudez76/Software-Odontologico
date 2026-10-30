import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { AnalyticsAuditView } from './AnalyticsAuditView';

vi.mock('../director-dashboard', () => ({
  DirectorDashboard: () => <div>Mock Director Dashboard</div>,
}));

vi.mock('../audit-log-viewer', () => ({
  AuditLogViewer: () => <div>Mock Audit Log Viewer</div>,
}));

describe('AnalyticsAuditView Component', () => {
  it('renders tabs and defaults to Tablero Directivo', () => {
    render(<AnalyticsAuditView />);

    expect(
      screen.getByText('Inteligencia de Negocios y Auditoría Forense'),
    ).toBeDefined();
    expect(screen.getByText('Mock Director Dashboard')).toBeDefined();
  });

  it('switches to Auditoría Forense LOPDP tab on click', () => {
    render(<AnalyticsAuditView />);

    const auditTab = screen.getByRole('tab', {
      name: /Auditoría Forense LOPDP/i,
    });
    fireEvent.click(auditTab);

    expect(screen.getByText('Mock Audit Log Viewer')).toBeDefined();
  });
});
