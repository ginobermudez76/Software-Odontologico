import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './PrescriptionManager.module.css';
import { PrescriptionManagerProps } from './PrescriptionManager.types';
import { usePrescriptionManager, COMMON_DENTAL_MEDICATIONS } from './usePrescriptionManager';

export const PrescriptionManager: React.FC<PrescriptionManagerProps> = ({
  patientId,
  patientName,
  patientAlerts = [],
  canWrite = true,
  onPrescriptionCreated,
}) => {
  const {
    prescriptions,
    isLoading,
    isSubmitting,
    feedback,
    items,
    instructions,
    setInstructions,
    isNewModalOpen,
    allergyModal,
    setAllergyModal,
    addMedication,
    removeMedication,
    updateMedication,
    openNewPrescriptionModal,
    closeNewPrescriptionModal,
    submitPrescription,
  } = usePrescriptionManager(patientId, onPrescriptionCreated);

  return (
    <div className={styles.container}>
      {/* Header bar */}
      <header className={styles.headerBar}>
        <div className={styles.titleGroup}>
          <MaterialIcon name="prescriptions" size={24} />
          <div>
            <h2 className={styles.title}>Recetario Odontológico Electrónico</h2>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              {patientName ? `Paciente: ${patientName}` : 'Prescripción Farmacológica'}
              {patientAlerts.length > 0 && (
                <span style={{ color: '#dc2626', fontWeight: 600, marginLeft: '0.5rem' }}>
                  (Alertas: {patientAlerts.join(', ')})
                </span>
              )}
            </div>
          </div>
        </div>

        {canWrite && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openNewPrescriptionModal}
          >
            <MaterialIcon name="medication" size={18} />
            Emitir Nueva Receta
          </button>
        )}
      </header>

      {feedback && (
        <div
          className={`${styles.feedbackAlert} ${feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}`}
          role="alert"
        >
          <MaterialIcon name={feedback.type === 'success' ? 'check_circle' : 'error'} size={20} />
          {feedback.message}
        </div>
      )}

      {/* Grid of Prescriptions */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          <MaterialIcon name="sync" size={24} className="animate-spin" />
          <p style={{ marginTop: '0.5rem' }}>Cargando recetas médicas...</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            padding: '2.5rem',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <MaterialIcon name="prescriptions" size={36} />
          <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>
            No hay recetas odontológicas emitidas para este paciente.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {prescriptions.map((rx) => (
            <article key={rx.id} className={styles.rxCard}>
              <div>
                <header className={styles.rxHeader}>
                  <div className={styles.doctorName}>
                    Dr(a). {rx.doctor?.firstName} {rx.doctor?.lastName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {new Date(rx.createdAt).toLocaleDateString()}
                  </div>
                </header>

                <div className={styles.medsList} style={{ marginTop: '0.75rem' }}>
                  {rx.items.map((item, idx) => (
                    <div key={idx} className={styles.medItem}>
                      <div className={styles.medName}>{item.name}</div>
                      <div className={styles.medDose}>
                        Dosis: {item.dose} • {item.frequency} • {item.duration}
                      </div>
                      {item.indications && (
                        <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.15rem' }}>
                          Indicaciones: {item.indications}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {rx.instructions && (
                  <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    Nota: {rx.instructions}
                  </div>
                )}
              </div>

              <div className={styles.qrBox}>
                <MaterialIcon name="qr_code_2" size={28} />
                <div>
                  <div style={{ fontWeight: 600 }}>Verificación Farmacéutica:</div>
                  <div className={styles.qrCodeText}>{rx.qrVerificationCode}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* New Prescription Modal */}
      {isNewModalOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <header className={styles.modalHeader}>
              <span>Emitir Receta Odontológica Electrónica</span>
              <button
                type="button"
                onClick={closeNewPrescriptionModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              {/* Quick Medication Palette */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Fármacos Frecuentes en Odontología:
                </label>
                <div className={styles.quickMedChips}>
                  {COMMON_DENTAL_MEDICATIONS.map((med, i) => (
                    <button
                      key={i}
                      type="button"
                      className={styles.quickMedChip}
                      onClick={() => addMedication(med)}
                    >
                      + {med.name.split(' ')[0]} {med.dose}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Fármacos Prescritos ({items.length}):
                </label>
                {items.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '0.375rem', color: '#64748b', fontSize: '0.8125rem' }}>
                    Seleccione un fármaco de la lista superior o agréguelo manualmente.
                  </div>
                ) : (
                  <table className={styles.formTable}>
                    <thead>
                      <tr>
                        <th>Medicamento</th>
                        <th>Dosis</th>
                        <th>Frecuencia</th>
                        <th>Duración</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              type="text"
                              className={styles.inputField}
                              value={item.name}
                              onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                              placeholder="Fármaco"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className={styles.inputField}
                              value={item.dose}
                              onChange={(e) => updateMedication(idx, 'dose', e.target.value)}
                              placeholder="Dosis"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className={styles.inputField}
                              value={item.frequency}
                              onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                              placeholder="Frecuencia"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className={styles.inputField}
                              value={item.duration}
                              onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                              placeholder="Duración"
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.removeBtn}
                              onClick={() => removeMedication(idx)}
                              title="Eliminar"
                            >
                              <MaterialIcon name="delete" size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                  Instrucciones Generales de Alarma
                </label>
                <textarea
                  className={styles.inputField}
                  rows={2}
                  style={{ resize: 'vertical' }}
                  placeholder="En caso de reacción adversa o fiebre, suspender medicación y acudir a urgencias..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeNewPrescriptionModal}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => submitPrescription(false)}
                disabled={isSubmitting || items.length === 0}
              >
                <MaterialIcon name={isSubmitting ? 'sync' : 'qr_code'} size={18} />
                {isSubmitting ? 'Generando...' : 'Emitir y Generar QR'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Allergy Conflict Warning Modal */}
      {allergyModal.isOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalBox} style={{ maxWidth: '500px' }}>
            <header className={styles.modalHeader} style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MaterialIcon name="warning" size={22} />
                <span>Alerta Crítica de Alergia Farmacológica</span>
              </div>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.dangerAlert}>{allergyModal.warningDetail}</div>
              <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.4 }}>
                La prescripción actual entra en colisión directa con los antecedentes alérgicos registrados para este paciente. ¿Desea omitir esta alerta bajo criterio clínico responsable y continuar con la emisión?
              </p>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setAllergyModal({ isOpen: false, warningDetail: '' })}
                disabled={isSubmitting}
              >
                Modificar Prescripción
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                style={{ backgroundColor: '#dc2626' }}
                onClick={() => submitPrescription(true)}
                disabled={isSubmitting}
              >
                <MaterialIcon name="check" size={16} />
                Confirmar Emisión Excepcional
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

