import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './DoctorSettlementManager.module.css';
import { DoctorSettlementManagerProps } from './DoctorSettlementManager.types';
import { useDoctorSettlementManager } from './useDoctorSettlementManager';

export const DoctorSettlementManager: React.FC<DoctorSettlementManagerProps> = ({
  canWrite = true,
  doctors,
  onSettlementGenerated,
}) => {
  const {
    selectedDoctorId,
    setSelectedDoctorId,
    periodStart,
    setPeriodStart,
    periodEnd,
    setPeriodEnd,
    preview,
    settlements,
    isLoadingPreview,
    isSubmitting,
    feedback,
    calculatePreview,
    generateSettlement,
    markAsPaid,
  } = useDoctorSettlementManager(doctors, onSettlementGenerated);

  return (
    <div className={styles.container}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <MaterialIcon name="payments" size={24} />
          <div>
            <h2 className={styles.title}>Liquidación de Honorarios y Comisiones Médicas</h2>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Cálculo automático de comisiones odontológicas con deducción previa de costos de laboratorio externo
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: feedback.type === 'success' ? '#166534' : '#991b1b',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <MaterialIcon
            name={feedback.type === 'success' ? 'check_circle' : 'error'}
            size={18}
          />
          {feedback.message}
        </div>
      )}

      {/* Regla RN-07 Banner */}
      <div className={styles.rn07Banner}>
        <MaterialIcon name="calculate" size={20} />
        <div>
          <strong>Regla Inviolable RN-07 (Deducción Previa de Costos de Laboratorio Dental):</strong> Antes de aplicar el porcentaje de honorario del odontólogo, el sistema deduce obligatoriamente el costo facturado por el laboratorio dental externo:
          <code style={{ marginLeft: '0.5rem', background: '#dbeafe', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
            Base Comisionable = Monto Procedimiento - Costo Lab Externo
          </code>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.field}>
          <label className={styles.label}>Odontólogo:</label>
          <select
            className={styles.selectInput}
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            <option value="00000000-0000-0000-0000-000000000002">Dr. Carlos Mendoza</option>
            <option value="00000000-0000-0000-0000-000000000003">Dra. María Elena Ramos</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Fecha Inicio Periodo:</label>
          <input
            type="date"
            className={styles.dateInput}
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Fecha Fin Periodo:</label>
          <input
            type="date"
            className={styles.dateInput}
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
          />
        </div>

        <button
          type="button"
          className={styles.btnCalculate}
          onClick={calculatePreview}
          disabled={isLoadingPreview}
        >
          <MaterialIcon name="refresh" size={16} />
          {isLoadingPreview ? 'Calculando...' : 'Recalcular'}
        </button>
      </div>

      {/* KPI Cards */}
      {preview && (
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Total Procedimientos Atendidos</span>
            <span className={styles.kpiValue}>{preview.totalProceduresCount}</span>
          </div>

          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Monto Bruto Facturado</span>
            <span className={styles.kpiValue}>${preview.grossAmount.toFixed(2)}</span>
          </div>

          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>(-) Costos Laboratorio Deducidos (RN-07)</span>
            <span className={`${styles.kpiValue} ${styles.kpiDeduction}`}>
              -${preview.totalLabCosts.toFixed(2)}
            </span>
          </div>

          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Base Comisionable Neta</span>
            <span className={styles.kpiValue}>${preview.netCommissionableBase.toFixed(2)}</span>
          </div>

          <div className={styles.kpiCard} style={{ borderColor: '#86efac', backgroundColor: '#f0fdf4' }}>
            <span className={styles.kpiLabel} style={{ color: '#166534' }}>Honorarios Médicos a Liquidar</span>
            <span className={`${styles.kpiValue} ${styles.kpiEarning}`}>
              ${preview.netCommissionPaid.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Settlement Preview Table */}
      {preview && (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeaderBar}>
            <h3 className={styles.tableTitle}>
              Desglose de Procedimientos Atendidos en el Periodo
            </h3>

            {canWrite && (
              <button
                type="button"
                className={styles.btnGenerate}
                onClick={generateSettlement}
                disabled={isSubmitting || preview.totalProceduresCount === 0}
              >
                <MaterialIcon name="check_circle" size={16} />
                {isSubmitting ? 'Registrando...' : 'Generar Liquidación Formal'}
              </button>
            )}
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Procedimiento</th>
                <th>Código</th>
                <th>Monto Cobrado</th>
                <th>Costo Lab (RN-07)</th>
                <th>Base Comisionable</th>
                <th>% Comisión</th>
                <th style={{ textAlign: 'right' }}>Honorario Odontólogo</th>
              </tr>
            </thead>
            <tbody>
              {preview.items.map((it, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{it.procedureName}</strong>
                  </td>
                  <td>
                    <code>{it.procedureCode}</code>
                  </td>
                  <td>${it.procedurePrice.toFixed(2)}</td>
                  <td>
                    {it.labCost > 0 ? (
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>
                        -${it.labCost.toFixed(2)}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>$0.00</span>
                    )}
                  </td>
                  <td>
                    <strong>${it.commissionableBase.toFixed(2)}</strong>
                  </td>
                  <td>{it.commissionRate}%</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                    ${it.doctorEarning.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Historical Settlements List */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeaderBar}>
          <h3 className={styles.tableTitle}>Histórico de Liquidaciones Emitidas</h3>
        </div>

        {settlements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            No hay liquidaciones previas registradas para este profesional.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>N° Liquidación</th>
                <th>Periodo</th>
                <th>Procedimientos</th>
                <th>Facturado</th>
                <th>Lab Deducido (RN-07)</th>
                <th>Base Neta</th>
                <th>Total Liquidado</th>
                <th>Estado</th>
                {canWrite && <th style={{ textAlign: 'right' }}>Acción</th>}
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id}>
                  <td>
                    <code>{s.settlementCode}</code>
                  </td>
                  <td>
                    {new Date(s.periodStart).toLocaleDateString()} al{' '}
                    {new Date(s.periodEnd).toLocaleDateString()}
                  </td>
                  <td>{s.totalProceduresCount}</td>
                  <td>${Number(s.grossAmount).toFixed(2)}</td>
                  <td style={{ color: '#dc2626' }}>-${Number(s.totalLabCosts).toFixed(2)}</td>
                  <td>${Number(s.netCommissionableBase).toFixed(2)}</td>
                  <td>
                    <strong style={{ color: '#059669', fontSize: '0.9375rem' }}>
                      ${Number(s.netCommissionPaid).toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        s.status === 'PAGADO' ? styles.badgePagado : styles.badgePendiente
                      }`}
                    >
                      <MaterialIcon
                        name={s.status === 'PAGADO' ? 'paid' : 'schedule'}
                        size={14}
                      />
                      {s.status}
                    </span>
                  </td>
                  {canWrite && (
                    <td style={{ textAlign: 'right' }}>
                      {s.status === 'PENDIENTE' && (
                        <button
                          type="button"
                          className={styles.btnPay}
                          onClick={() => markAsPaid(s.id)}
                          disabled={isSubmitting}
                        >
                          <MaterialIcon name="payment" size={14} />
                          Pagar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

