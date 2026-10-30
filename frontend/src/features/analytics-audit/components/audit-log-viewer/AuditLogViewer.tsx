import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './AuditLogViewer.module.css';
import { AuditLogViewerProps } from './AuditLogViewer.types';
import { useAuditLogViewer } from './useAuditLogViewer';

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  initialResource,
}) => {
  const {
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
    refresh,
  } = useAuditLogViewer(initialResource);

  const getActionClass = (action: string) => {
    switch (action) {
      case 'READ':
        return styles.badgeRead;
      case 'WRITE':
        return styles.badgeWrite;
      case 'UPDATE':
        return styles.badgeUpdate;
      case 'SOFT_DELETE':
        return styles.badgeDelete;
      case 'LOGIN':
        return styles.badgeLogin;
      default:
        return styles.badgeRead;
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <MaterialIcon name="policy" size={24} />
          <div>
            <h2 className={styles.title}>Auditoría Forense Inmutable (Cumplimiento LOPDP)</h2>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Trazabilidad criptográfica append-only de accesos y modificaciones a historias clínicas (ASVS Nivel 2)
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.5rem 0.875rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <MaterialIcon name="refresh" size={16} />
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* ASVS / LOPDP Banner */}
      <div className={styles.asvsBanner}>
        <MaterialIcon name="lock" size={20} />
        <div>
          <strong>Garantía de No Repudio (Hash SHA-256):</strong> Cada registro de auditoría almacena la firma digital inmutable del actor, la dirección IP de origen, el timestamp exacto y el hash criptográfico para auditorías de cumplimiento legal.
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.field}>
          <label className={styles.label}>Filtrar por Acción:</label>
          <select
            className={styles.selectInput}
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="TODAS">-- Todas las acciones --</option>
            <option value="LOGIN">LOGIN</option>
            <option value="READ">READ (Consulta sensible)</option>
            <option value="WRITE">WRITE (Creación)</option>
            <option value="UPDATE">UPDATE (Modificación)</option>
            <option value="SOFT_DELETE">SOFT_DELETE (Anulación)</option>
            <option value="EXPORT">EXPORT (Descarga de datos)</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Filtrar por Recurso:</label>
          <input
            type="text"
            className={styles.textInput}
            placeholder="Ej. EXPEDIENTE_CLINICO"
            value={selectedResource}
            onChange={(e) => {
              setSelectedResource(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#64748b' }}>
          Total registros registrados: <strong>{total}</strong>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Rol</th>
              <th>Acción</th>
              <th>Recurso Auditado</th>
              <th>IP Origen</th>
              <th>Firma Criptográfica SHA-256</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>
                  <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                    {new Date(log.eventTimestamp).toLocaleString()}
                  </span>
                </td>
                <td>
                  <strong>
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Sistema / Anónimo'}
                  </strong>
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    {log.userRole || 'SISTEMA'}
                  </span>
                </td>
                <td>
                  <span className={`${styles.actionBadge} ${getActionClass(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td>
                  <code>{log.resource}</code>
                </td>
                <td>
                  <code>{log.ipAddress || '-'}</code>
                </td>
                <td>
                  <span
                    className={styles.hashBadge}
                    title={log.integrityHash || 'SHA-256 no registrado'}
                  >
                    {log.integrityHash ? `${log.integrityHash.slice(0, 16)}...` : 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className={styles.paginationBar}>
          <span>
            Página {page} de {totalPages || 1}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
