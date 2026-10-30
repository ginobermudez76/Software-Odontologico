import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './SoepEditor.module.css';
import { SoepEditorProps } from './SoepEditor.types';
import { useSoepEditor, COMMON_CIE10_CODES } from './useSoepEditor';

export const SoepEditor: React.FC<SoepEditorProps> = ({
  patientId,
  patientName,
  canWrite = true,
  onNoteCreated,
}) => {
  const {
    notes,
    isLoading,
    isSubmitting,
    editingNoteId,
    formData,
    feedback,
    adendaModal,
    setAdendaModal,
    handleFieldChange,
    handleAppendCie10,
    startEditNote,
    cancelEdit,
    submitNote,
    openAdendaModal,
    closeAdendaModal,
    submitAdenda,
  } = useSoepEditor(patientId, onNoteCreated);

  return (
    <div className={styles.container}>
      {/* Editor Form Card */}
      {canWrite && (
        <section className={styles.card} aria-label="Editor de Nota de Evolución SOEP">
          <header className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <MaterialIcon name="edit_note" size={24} />
              {editingNoteId ? 'Editar Nota de Evolución Clínica' : 'Nueva Nota de Evolución Médica (Formato SOEP)'}
            </div>
            {editingNoteId && (
              <span className={styles.statusPill} style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                Modo Edición (Dentro de 24h)
              </span>
            )}
          </header>

          <form onSubmit={submitNote}>
            <div className={styles.formGrid}>
              {/* Subjetivo (S) */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <span className={`${styles.soepBadge} ${styles.badgeS}`}>S</span>
                  <label htmlFor="soep-s" className={styles.sectionLabel}>
                    Subjetivo (Motivo de consulta y síntomas referidos)
                  </label>
                </div>
                <textarea
                  id="soep-s"
                  className={styles.textarea}
                  rows={2}
                  placeholder="Síntomas que describe el paciente: dolor, inflamación, sensibilidad al frío/calor, tiempo de evolución..."
                  value={formData.subjective}
                  onChange={(e) => handleFieldChange('subjective', e.target.value)}
                  required
                />
              </div>

              {/* Objetivo (O) */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <span className={`${styles.soepBadge} ${styles.badgeO}`}>O</span>
                  <label htmlFor="soep-o" className={styles.sectionLabel}>
                    Objetivo (Examen clínico, inspección, sondeo y percusión)
                  </label>
                </div>
                <textarea
                  id="soep-o"
                  className={styles.textarea}
                  rows={2}
                  placeholder="Signos detectados: cavidades, cambios de coloración, movilidad, respuesta a percusión, sondaje periodontal..."
                  value={formData.objective}
                  onChange={(e) => handleFieldChange('objective', e.target.value)}
                  required
                />
              </div>

              {/* Evaluación (E) */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <span className={`${styles.soepBadge} ${styles.badgeE}`}>E</span>
                  <label htmlFor="soep-e" className={styles.sectionLabel}>
                    Evaluación (Diagnóstico presuntivo / definitivo y CIE-10)
                  </label>
                </div>
                <div className={styles.chipGroup}>
                  {COMMON_CIE10_CODES.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      className={styles.chip}
                      onClick={() => handleAppendCie10(item.code, item.label)}
                    >
                      + {item.code} {item.label}
                    </button>
                  ))}
                </div>
                <textarea
                  id="soep-e"
                  className={styles.textarea}
                  rows={2}
                  placeholder="Diagnóstico clínico y codificación CIE-10 odontológico..."
                  value={formData.assessment}
                  onChange={(e) => handleFieldChange('assessment', e.target.value)}
                  required
                />
              </div>

              {/* Plan (P) */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <span className={`${styles.soepBadge} ${styles.badgeP}`}>P</span>
                  <label htmlFor="soep-p" className={styles.sectionLabel}>
                    Plan (Procedimiento ejecutado, medicación y próximas citas)
                  </label>
                </div>
                <textarea
                  id="soep-p"
                  className={styles.textarea}
                  rows={2}
                  placeholder="Tratamiento realizado hoy, posología de medicamentos prescritos, recomendaciones y fecha de control..."
                  value={formData.plan}
                  onChange={(e) => handleFieldChange('plan', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.actionRow}>
              {editingNoteId && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={cancelEdit}
                  disabled={isSubmitting}
                >
                  Cancelar Edición
                </button>
              )}
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting}
              >
                <MaterialIcon name={isSubmitting ? 'sync' : 'save'} size={18} />
                {isSubmitting
                  ? 'Guardando...'
                  : editingNoteId
                    ? 'Actualizar Nota SOEP'
                    : 'Registrar Nota SOEP'}
              </button>
            </div>
          </form>
        </section>
      )}

      {feedback && (
        <div
          className={`${styles.feedbackAlert} ${feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}`}
          role="alert"
        >
          <MaterialIcon name={feedback.type === 'success' ? 'check_circle' : 'error'} size={20} />
          {feedback.message}
        </div>
      )}

      {/* Historical Notes Timeline */}
      <section aria-label="Historial de Evolución Médica">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MaterialIcon name="history_edu" size={22} />
          Historial de Notas de Evolución Médica ({notes.length})
        </h3>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <MaterialIcon name="sync" size={24} className="animate-spin" />
            <p style={{ marginTop: '0.5rem' }}>Cargando expediente clínico...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className={styles.card} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <MaterialIcon name="clinical_notes" size={36} />
            <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>No hay notas de evolución previas registradas para este paciente.</p>
          </div>
        ) : (
          <div className={styles.timeline}>
            {notes.map((note) => (
              <article key={note.id} className={styles.noteItem}>
                <header className={styles.noteHeader}>
                  <div className={styles.doctorMeta}>
                    <span className={styles.doctorName}>
                      Dr. {note.doctor?.firstName} {note.doctor?.lastName}
                    </span>
                    <span className={styles.noteTimestamp}>
                      Registrado: {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    {note.isEditable ? (
                      <span className={`${styles.statusPill} ${styles.pillEditable}`}>
                        <MaterialIcon name="schedule" size={14} />
                        Editable (Quedan {note.remainingHoursToEdit}h)
                      </span>
                    ) : (
                      <span className={`${styles.statusPill} ${styles.pillLocked}`}>
                        <MaterialIcon name="lock" size={14} />
                        Inmutable (24h Cumplidas)
                      </span>
                    )}
                  </div>
                </header>

                <div className={styles.soepContentGrid}>
                  <div className={styles.soepBlock}>
                    <div className={styles.soepBlockTitle}>[S] Subjetivo</div>
                    <div className={styles.soepBlockText}>{note.subjective}</div>
                  </div>

                  <div className={styles.soepBlock}>
                    <div className={styles.soepBlockTitle}>[O] Objetivo</div>
                    <div className={styles.soepBlockText}>{note.objective}</div>
                  </div>

                  <div className={styles.soepBlock}>
                    <div className={styles.soepBlockTitle}>[E] Evaluación</div>
                    <div className={styles.soepBlockText}>{note.assessment}</div>
                  </div>

                  <div className={styles.soepBlock}>
                    <div className={styles.soepBlockTitle}>[P] Plan</div>
                    <div className={styles.soepBlockText}>{note.plan}</div>
                  </div>
                </div>

                {/* Adendas List */}
                {note.adendas && note.adendas.length > 0 && (
                  <div className={styles.adendasList}>
                    {note.adendas.map((adenda) => (
                      <div key={adenda.id} className={styles.adendaItem}>
                        <div className={styles.adendaHeader}>
                          <span className={styles.adendaTitle}>
                            <MaterialIcon name="history_toggle_off" size={16} />
                            {adenda.subjective}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#92400e' }}>
                            {new Date(adenda.createdAt).toLocaleString()} - Dr. {adenda.doctor?.firstName} {adenda.doctor?.lastName}
                          </span>
                        </div>
                        <div className={styles.adendaText}>{adenda.clarificationText}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions per note (RBAC controlled) */}
                {canWrite && (
                  <div className={styles.noteActions}>
                    {note.isEditable && (
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => startEditNote(note)}
                      >
                        <MaterialIcon name="edit" size={16} />
                        Editar Nota
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => openAdendaModal(note.id, new Date(note.createdAt).toLocaleString())}
                    >
                      <MaterialIcon name="post_add" size={16} />
                      Añadir Adenda / Aclaratoria
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Adenda Modal */}
      {adendaModal.isOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <header className={styles.modalHeader}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                Emitir Nota de Adenda / Aclaratoria
              </div>
              <button
                type="button"
                onClick={closeAdendaModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                Vinculada formalmente a la nota del: <strong>{adendaModal.targetNoteDate}</strong>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                  Motivo de la Adenda
                </label>
                <input
                  type="text"
                  className={styles.textarea}
                  style={{ height: '38px', resize: 'none' }}
                  value={adendaModal.reason}
                  onChange={(e) =>
                    setAdendaModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                  Texto Aclaratorio Médico Inmutable
                </label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  placeholder="Escriba los detalles aclaratorios, rectificaciones o ampliación diagnóstica con firma profesional..."
                  value={adendaModal.clarificationText}
                  onChange={(e) =>
                    setAdendaModal((prev) => ({ ...prev, clarificationText: e.target.value }))
                  }
                />
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeAdendaModal}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={submitAdenda}
                disabled={isSubmitting}
              >
                <MaterialIcon name={isSubmitting ? 'sync' : 'verified'} size={18} />
                {isSubmitting ? 'Firmando Adenda...' : 'Firmar y Registrar Adenda'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

