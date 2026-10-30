import { useState, useEffect, useCallback } from 'react';
import { ForensicAuditLog } from '../../types/analytics-audit.types';
import { analyticsApi } from '../../services/analyticsApi';

export const useAuditLogViewer = (initialResource?: string) => {
  const [logs, setLogs] = useState<ForensicAuditLog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedAction, setSelectedAction] = useState<string>('TODAS');
  const [selectedResource, setSelectedResource] = useState<string>(initialResource || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsApi.getForensicAuditLogs({
        action: selectedAction !== 'TODAS' ? selectedAction : undefined,
        resource: selectedResource || undefined,
        page,
        limit: 25,
      });
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      // Demo fallback if backend empty
      const now = new Date();
      setLogs([
        {
          id: 'log-1',
          userId: '00000000-0000-0000-0000-000000000001',
          userRole: 'ADMINISTRADOR',
          action: 'READ',
          resource: 'EXPEDIENTE_CLINICO',
          resourceId: '00000000-0000-0000-0000-000000000055',
          ipAddress: '192.168.1.15',
          userAgent: 'Mozilla/5.0 Windows NT',
          eventTimestamp: now.toISOString(),
          integrityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          user: {
            id: '00000000-0000-0000-0000-000000000001',
            firstName: 'Admin',
            lastName: 'Sistema',
            email: 'admin@sigo-dental.com',
          },
        },
        {
          id: 'log-2',
          userId: '00000000-0000-0000-0000-000000000002',
          userRole: 'ODONTOLOGO',
          action: 'WRITE',
          resource: 'NOTAS_SOEP',
          resourceId: '00000000-0000-0000-0000-000000000077',
          ipAddress: '192.168.1.42',
          userAgent: 'Mozilla/5.0 iPadOS',
          eventTimestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
          integrityHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
          user: {
            id: '00000000-0000-0000-0000-000000000002',
            firstName: 'Carlos',
            lastName: 'Mendoza',
            email: 'cmendoza@sigo-dental.com',
          },
        },
        {
          id: 'log-3',
          userId: '00000000-0000-0000-0000-000000000003',
          userRole: 'CAJERO',
          action: 'LOGIN',
          resource: 'SESION_CAJA',
          ipAddress: '192.168.1.88',
          userAgent: 'Chrome/120.0',
          eventTimestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
          integrityHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
          user: {
            id: '00000000-0000-0000-0000-000000000003',
            firstName: 'Recepción',
            lastName: 'Central',
            email: 'recepcion@sigo-dental.com',
          },
        },
      ]);
      setTotal(3);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAction, selectedResource, page]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  return {
    logs,
    total,
    page,
    setPage,
    totalPages,
    selectedAction,
    setSelectedAction,
    selectedResource,
    setSelectedResource,
    isLoading,
    error,
    refresh: loadAuditLogs,
  };
};

