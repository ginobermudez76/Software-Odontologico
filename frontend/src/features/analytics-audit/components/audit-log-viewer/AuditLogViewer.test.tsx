import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { AuditLogViewer } from './AuditLogViewer';
import { analyticsApi } from '../../services/analyticsApi';
import { AuditLogsResponse } from '../../types/analytics-audit.types';

vi.mock('../../services/analyticsApi');

const mockAuditLogs: AuditLogsResponse = {
  total: 1,
  page: 1,
  limit: 25,
  totalPages: 1,
  logs: [
    {
      id: 'log-101',
      userId: 'user-1',
      userRole: 'ADMINISTRADOR',
      action: 'READ',
      resource: 'EXPEDIENTE_CLINICO',
      ipAddress: '192.168.1.50',
      eventTimestamp: new Date().toISOString(),
      integrityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      user: {
        id: 'user-1',
        firstName: 'Auditor',
        lastName: 'Seguridad',
        email: 'auditor@sigo-dental.com',
      },
    },
  ],
};

describe('AuditLogViewer Component (Sprint 11 - ASVS Nivel 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(analyticsApi, 'getForensicAuditLogs').mockResolvedValue(mockAuditLogs);
  });

  it('renders forensic audit log viewer with SHA-256 integrity notice', async () => {
    render(<AuditLogViewer />);

    expect(
      screen.getByText(/Auditoría Forense Inmutable \(Cumplimiento LOPDP\)/i),
    ).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Auditor Seguridad')).toBeDefined();
      expect(screen.getByText('EXPEDIENTE_CLINICO')).toBeDefined();
      expect(screen.getByText('192.168.1.50')).toBeDefined();
      expect(screen.getByText(/Garantía de No Repudio/i)).toBeDefined();
    });
  });
});

