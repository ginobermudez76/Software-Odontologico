import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './DirectorDashboard.module.css';
import { DirectorDashboardProps } from './DirectorDashboard.types';
import { useDirectorDashboard } from './useDirectorDashboard';

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({
  branchId,
  onExportCsv,
}) => {
  const {
    kpis,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    error,
    reloadKpis,
    exportCsv,
  } = useDirectorDashboard(branchId);

  const handleExport = () => {
    exportCsv();
    if (onExportCsv) onExportCsv();
  };

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <MaterialIcon name="analytics" size={24} />
          <div>
            <h2 className={styles.title}>Tablero de Control Directivo (BI)</h2>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Métricas ejecutivas de rendimiento clínico, ocupación de sillones y rentabilidad
            </div>
          </div>
        </div>

        <div className={styles.filterControls}>
          <input
            type="date"
            className={styles.dateInput}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span style={{ color: '#94a3b8' }}>a</span>
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button
            type="button"
            className={`${styles.btnAction} ${styles.btnPrimary}`}
            onClick={reloadKpis}
            disabled={isLoading}
          >
            <MaterialIcon name="refresh" size={16} />
            {isLoading ? 'Cargando...' : 'Filtrar'}
          </button>

          <button
            type="button"
            className={styles.btnAction}
            onClick={handleExport}
            disabled={!kpis}
          >
            <MaterialIcon name="download" size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#991b1b', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      {kpis && (
        <div className={styles.kpiGrid}>
          {/* No Show Rate */}
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Tasa de Ausentismo (No-Show)</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fff1f2', color: '#e11d48' }}>
                <MaterialIcon name="person_off" size={20} />
              </div>
            </div>
            <div className={styles.kpiValue} style={{ color: kpis.appointments.noShowRate > 15 ? '#e11d48' : '#0f172a' }}>
              {kpis.appointments.noShowRate}%
            </div>
            <div className={styles.kpiSubtext}>
              {kpis.appointments.noShow} ausencias de {kpis.appointments.total} citas agendadas
            </div>
          </div>

          {/* Chair Occupancy */}
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Ocupación de Sillones Físicos</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                <MaterialIcon name="chair" size={20} />
              </div>
            </div>
            <div className={styles.kpiValue}>{kpis.appointments.chairOccupancyRate}%</div>
            <div className={styles.kpiSubtext}>
              {kpis.appointments.attended} procedimientos atendidos en sillón
            </div>
          </div>

          {/* Average Ticket */}
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Ticket Promedio por Paciente</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                <MaterialIcon name="receipt" size={20} />
              </div>
            </div>
            <div className={styles.kpiValue}>${kpis.financials.averageTicket.toFixed(2)}</div>
            <div className={styles.kpiSubtext}>
              Basado en {kpis.financials.invoiceCount} facturas y boletas emitidas
            </div>
          </div>

          {/* Total Revenue */}
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Facturación Total Bruta</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <MaterialIcon name="payments" size={20} />
              </div>
            </div>
            <div className={styles.kpiValue}>${kpis.financials.totalRevenue.toFixed(2)}</div>
            <div className={styles.kpiSubtext}>Ingresos brutos del periodo</div>
          </div>

          {/* Lab Deductions (RN-07) */}
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Costos Lab Deducidos (RN-07)</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
                <MaterialIcon name="biotech" size={20} />
              </div>
            </div>
            <div className={styles.kpiValue} style={{ color: '#ea580c' }}>
              -${kpis.financials.totalLabCostsDeducted.toFixed(2)}
            </div>
            <div className={styles.kpiSubtext}>Deducciones previas a honorarios médicos</div>
          </div>

          {/* Net Margin */}
          <div className={styles.kpiCard} style={{ borderColor: '#86efac', backgroundColor: '#f0fdf4' }}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel} style={{ color: '#166534' }}>
                Margen Operativo Neto
              </span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                <MaterialIcon name="trending_up" size={20} />
              </div>
            </div>
            <div className={styles.kpiValue} style={{ color: '#15803d' }}>
              ${kpis.financials.grossMargin.toFixed(2)}
            </div>
            <div className={styles.kpiSubtext}>Rendimiento final de la clínica</div>
          </div>
        </div>
      )}

      {/* Top Procedures Ranking */}
      {kpis && (
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Procedimientos Odontológicos más Rentables</h3>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Top por volumen y facturación</span>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Procedimiento</th>
                <th>Cantidad Realizada</th>
                <th style={{ textAlign: 'right' }}>Total Facturado</th>
              </tr>
            </thead>
            <tbody>
              {kpis.topProcedures.map((proc, idx) => (
                <tr key={idx}>
                  <td>
                    <code>{proc.code}</code>
                  </td>
                  <td>
                    <strong>{proc.name}</strong>
                  </td>
                  <td>{proc.count} procedimientos</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    ${proc.totalBilled.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

