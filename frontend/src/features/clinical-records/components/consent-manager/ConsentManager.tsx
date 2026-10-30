import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './ConsentManager.module.css';
import { ConsentManagerProps } from './ConsentManager.types';
import { useConsentManager } from './useConsentManager';
import { SignaturePad } from '../signature-pad';
import { CONSENT_TEMPLATES } from '../../types/consent-prescription.types';

export const ConsentManager: React.FC<ConsentManagerProps> = ({
  patientId,
  patientName,
  canWrite = true,
  onConsentSigned,
}) => {
  const {
    consents,
    isLoading,
    isSubmitting,
    feedback,
    newModal,
    setNewModal,
    signModal,
    selectTemplate,
    openNewConsentModal,
    closeNewConsentModal,
    submitNewConsent,
    openSignModal,
    closeSignModal,
    handleSignatureChange,
    submitSignature,
  } = useConsentManager(patientId, onConsentSigned);

  return (
    <div className={styles.container}>
      {/* Header bar */}
      <header className={styles.headerBar}>
        <div className={styles.titleGroup}>
          <MaterialIcon name="verified_user" size={24} />
          <div>
            <h2 className={styles.title}>Consentimientos Informados Digitales</h2>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              {patientName ? `Paciente: ${patientName}` : 'Expediente Clínico Legal'}
            </div>
          </div>
        </div>

        {canWrite && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openNewConsentModal}
          >
            <MaterialIcon name="add_circle" size={18} />
            Nuevo Consentimiento
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

      {/* Grid of Consents */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          <MaterialIcon name="sync" size={24} className="animate-spin" />
          <p style={{ marginTop: '0.5rem' }}>Cargando consentimientos...</p>
        </div>
      ) : consents.length === 0 ? (
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
          <MaterialIcon name="folder_open" size={36} />
          <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>
            No hay consentimientos informados registrados para este paciente.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {consents.map((consent) => (
            <article key={consent.id} className={styles.consentCard}>
              <div className={styles.cardTop}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h3 className={styles.procedureTitle}>{consent.procedureName}</h3>
                  {consent.isSigned ? (
                    <span className={`${styles.statusPill} ${styles.pillSigned}`}>
                      <MaterialIcon name="verified" size={14} />
                      Firmado
                    </span>
                  ) : (
                    <span className={`${styles.statusPill} ${styles.pillPending}`}>
                      <MaterialIcon name="pending" size={14} />
                      Pendiente
                    </span>
                  )}
                </div>

                <div className={styles.risksSnippet}>{consent.risksDescription}</div>

                {consent.isSigned && consent.documentHash && (
                  <div className={styles.hashMeta} title="Hash criptográfico SHA-256">
                    SHA-256: {consent.documentHash.substring(0, 24)}...
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Fecha: {new Date(consent.createdAt).toLocaleDateString()}
                  {consent.signedAt && ` • Firmado: ${new Date(consent.signedAt).toLocaleDateString()}`}
                </div>
              </div>

              <div className={styles.cardActions}>
                {!consent.isSigned && canWrite && (
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => openSignModal(consent)}
                  >
                    <MaterialIcon name="draw" size={16} />
                    Firmar en Pantalla
                  </button>
                )}
                {consent.isSigned && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MaterialIcon name="lock" size={14} />
                    Documento Legal Inalterable
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* New Consent Modal */}
      {newModal.isOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <header className={styles.modalHeader}>
              <span>Generar Consentimiento Informado</span>
              <button
                type="button"
                onClick={closeNewConsentModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Plantillas Clínicas Preconfiguradas:
                </label>
                <div className={styles.templateChips}>
                  {Object.entries(CONSENT_TEMPLATES).map(([key, tpl]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.templateChip} ${newModal.templateKey === key ? styles.templateChipActive : ''}`}
                      onClick={() => selectTemplate(key)}
                    >
                      {tpl.procedureName.split(' ')[0]} ({key})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                  Nombre del Procedimiento
                </label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={newModal.procedureName}
                  onChange={(e) =>
                    setNewModal((prev) => ({ ...prev, procedureName: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                  Declaración de Riesgos y Alternativas Terapéuticas
                </label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={newModal.risksDescription}
                  onChange={(e) =>
                    setNewModal((prev) => ({ ...prev, risksDescription: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeNewConsentModal}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={submitNewConsent}
                disabled={isSubmitting}
              >
                <MaterialIcon name={isSubmitting ? 'sync' : 'save'} size={18} />
                {isSubmitting ? 'Creando...' : 'Crear Consentimiento'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Signing Modal with SignaturePad */}
      {signModal.isOpen && signModal.consent && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalBox} style={{ maxWidth: '640px' }}>
            <header className={styles.modalHeader}>
              <span>Firma Biométrica: {signModal.consent.procedureName}</span>
              <button
                type="button"
                onClick={closeSignModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.4 }}>
                Yo, como paciente o representante legal debidamente informado, declaro haber comprendido la naturaleza, riesgos y beneficios del procedimiento:
                <strong> {signModal.consent.procedureName}</strong>.
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', color: '#64748b' }}>
                {signModal.consent.risksDescription}
              </div>

              {/* Canvas Signature Pad */}
              <SignaturePad onSignatureChange={handleSignatureChange} />
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeSignModal}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={submitSignature}
                disabled={isSubmitting || !signModal.signatureData}
              >
                <MaterialIcon name={isSubmitting ? 'sync' : 'verified'} size={18} />
                {isSubmitting ? 'Firmando y Encriptando...' : 'Firmar y Sellar con SHA-256'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

