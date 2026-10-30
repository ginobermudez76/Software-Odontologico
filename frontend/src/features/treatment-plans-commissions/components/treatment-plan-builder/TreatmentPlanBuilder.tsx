import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './TreatmentPlanBuilder.module.css';
import { TreatmentPlanBuilderProps } from './TreatmentPlanBuilder.types';
import { useTreatmentPlanBuilder } from './useTreatmentPlanBuilder';
import { PlanStatus } from '../../types/treatment-plans-commissions.types';

export const TreatmentPlanBuilder: React.FC<TreatmentPlanBuilderProps> = ({
  patientId,
  doctorId,
  canWrite = true,
  onPlanCreated,
}) => {
  const {
    plans,
    selectedPlan,
    setSelectedPlan,
    isLoading,
    isSubmitting,
    isModalOpen,
    setIsModalOpen,
    feedback,
    draft,
    setDraft,
    draftTotalAmount,
    availableProcedures,
    approvePlan,
    rejectPlan,
    schedulePlanItem,
    submitNewPlan,
  } = useTreatmentPlanBuilder(patientId, doctorId, onPlanCreated);

  const getStatusBadge = (status: PlanStatus, isExpired?: boolean) => {
    if (isExpired || status === 'VENCIDO') {
      return (
        <span className={`${styles.badge} ${styles.badgeVencido}`}>
          <MaterialIcon name="event_busy" size={14} />
          Vencido (&gt; 30d)
        </span>
      );
    }
    switch (status) {
      case 'EMITIDO':
        return (
          <span className={`${styles.badge} ${styles.badgeEmitido}`}>
            <MaterialIcon name="pending" size={14} />
            Emitido
          </span>
        );
      case 'APROBADO':
        return (
          <span className={`${styles.badge} ${styles.badgeAprobado}`}>
            <MaterialIcon name="check_circle" size={14} />
            Aprobado
          </span>
        );
      case 'RECHAZADO':
        return (
          <span className={`${styles.badge} ${styles.badgeRechazado}`}>
            <MaterialIcon name="cancel" size={14} />
            Rechazado
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.badgeEmitido}`}>
            {status}
          </span>
        );
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <MaterialIcon name="description" size={24} />
          <div>
            <h2 className={styles.title}>Presupuestos Odontológicos Multinivel</h2>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Planes clínicos estructurados por fases con control de vigencia y conversión directa a citas
            </div>
          </div>
        </div>

        {canWrite && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => setIsModalOpen(true)}
          >
            <MaterialIcon name="add" size={18} />
            Nuevo Presupuesto
          </button>
        )}
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

      {/* Regla RN-04 Banner */}
      <div
        className={`${styles.rn04Banner} ${
          selectedPlan?.isExpired ? styles.rn04ExpiredBanner : ''
        }`}
      >
        <MaterialIcon
          name={selectedPlan?.isExpired ? 'error' : 'verified_user'}
          size={20}
        />
        <div>
          <strong>Regla Inviolable RN-04 (Vigencia Legal de 30 Días):</strong> Todo presupuesto emitido tiene validez estricta de 30 días calendario.
          {selectedPlan && (
            <span style={{ marginLeft: '0.5rem' }}>
              {selectedPlan.isExpired ? (
                <strong style={{ color: '#dc2626' }}>
                  Este presupuesto ha caducado. Requiere revalidación de costos y diagnósticos.
                </strong>
              ) : (
                <span>
                  Vigencia actual: <strong>{selectedPlan.daysRemaining ?? 30} días restantes</strong> (Vence:{' '}
                  {new Date(selectedPlan.expiresAt).toLocaleDateString()}).
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Plans List / Grid */}
      <div className={styles.plansGrid}>
        {plans.map((p) => (
          <div
            key={p.id}
            className={`${styles.planCard} ${
              selectedPlan?.id === p.id ? styles.planCardSelected : ''
            }`}
            onClick={() => setSelectedPlan(p)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.planCardHeader}>
              <span className={styles.planCode}>{p.planCode}</span>
              {getStatusBadge(p.status, p.isExpired)}
            </div>

            <h3 className={styles.planTitle}>{p.title}</h3>
            {p.isAlternative && (
              <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 600 }}>
                Propuesta Alternativa (Económica)
              </span>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 'auto' }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                {p.phases.length} fases clínicas
              </span>
              <span className={styles.planAmount}>${Number(p.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Plan Details & Phases */}
      {selectedPlan && (
        <div className={styles.detailSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#0f172a' }}>
                Detalle del Presupuesto: {selectedPlan.planCode} - {selectedPlan.title}
              </h3>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                Emitido el {new Date(selectedPlan.issuedAt).toLocaleDateString()} por el profesional tratante
              </div>
            </div>

            {/* Actions Bar for Plan (Aprobar / Rechazar) */}
            {canWrite && selectedPlan.status === 'EMITIDO' && !selectedPlan.isExpired && (
              <div className={styles.actionsBar}>
                <button
                  type="button"
                  className={styles.btnApprove}
                  onClick={() => approvePlan(selectedPlan.id)}
                  disabled={isSubmitting}
                >
                  <MaterialIcon name="thumb_up" size={16} />
                  Aprobar Presupuesto
                </button>
                <button
                  type="button"
                  className={styles.btnReject}
                  onClick={() => rejectPlan(selectedPlan.id)}
                  disabled={isSubmitting}
                >
                  <MaterialIcon name="thumb_down" size={16} />
                  Rechazar
                </button>
              </div>
            )}
          </div>

          {/* Render Phases */}
          {selectedPlan.phases.map((phase) => (
            <div key={phase.id} className={styles.phaseContainer}>
              <div className={styles.phaseHeader}>
                <div>
                  <span style={{ color: '#0284c7', marginRight: '0.5rem' }}>
                    [Fase {phase.phaseNumber}]
                  </span>
                  <span>{phase.name}</span>
                </div>
                <span style={{ fontWeight: 800 }}>
                  Subtotal: ${Number(phase.subtotal).toFixed(2)}
                </span>
              </div>

              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>Procedimiento Clínico</th>
                    <th>Pieza / Superficie</th>
                    <th>Cant.</th>
                    <th>Precio Unit.</th>
                    <th>Descuento</th>
                    <th>Total</th>
                    <th>Estado</th>
                    {canWrite && <th style={{ textAlign: 'right' }}>Acción</th>}
                  </tr>
                </thead>
                <tbody>
                  {phase.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.procedure?.name || 'Procedimiento'}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Código: {item.procedure?.code || 'N/A'}
                        </div>
                      </td>
                      <td>
                        {item.toothNumber ? (
                          <code>
                            Pieza {item.toothNumber} {item.surface ? `(${item.surface})` : ''}
                          </code>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>General</span>
                        )}
                      </td>
                      <td>{item.quantity}</td>
                      <td>${Number(item.unitPrice).toFixed(2)}</td>
                      <td>{item.discountPercent > 0 ? `${item.discountPercent}%` : '-'}</td>
                      <td>
                        <strong>${Number(item.finalPrice).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {item.status}
                        </span>
                      </td>
                      {canWrite && (
                        <td style={{ textAlign: 'right' }}>
                          {item.status === 'APROBADO' && !item.appointmentId && (
                            <button
                              type="button"
                              className={styles.scheduleBtn}
                              onClick={() => schedulePlanItem(selectedPlan.id, item.id)}
                              disabled={isSubmitting}
                            >
                              <MaterialIcon name="calendar_month" size={14} />
                              Agendar Cita
                            </button>
                          )}
                          {item.appointmentId && (
                            <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>
                              Agendado
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* New Treatment Plan Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <header className={styles.modalHeader}>
              <span>Crear Nuevo Presupuesto Odontológico</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.formField}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Título del Presupuesto:
                </label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Ej. Plan de Rehabilitación Oral y Estética"
                />
              </div>

              <div className={styles.formField}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Descripción o Notas Clínicas:
                </label>
                <textarea
                  className={styles.inputField}
                  rows={2}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Detalles para el paciente..."
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={draft.isAlternative}
                  onChange={(e) => setDraft({ ...draft, isAlternative: e.target.checked })}
                />
                Marcar como Presupuesto Alternativo (Plan Económico)
              </label>

              <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '8px', fontSize: '0.8125rem', color: '#1e40af' }}>
                <MaterialIcon name="info" size={16} />
                <strong>Regla RN-04:</strong> Este presupuesto se registrará con 30 días de vigencia legal desde hoy.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 600 }}>Total Estimado:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  ${draftTotalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={submitNewPlan}
                disabled={isSubmitting}
              >
                <MaterialIcon name="save" size={18} />
                {isSubmitting ? 'Guardando...' : 'Emitir Presupuesto'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

