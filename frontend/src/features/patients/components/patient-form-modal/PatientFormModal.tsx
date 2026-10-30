import React from 'react';
import styles from './PatientFormModal.module.css';
import { PatientFormModalProps } from './PatientFormModal.types';
import { usePatientFormModal } from './usePatientFormModal';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const {
    formData,
    isMinor,
    calculatedAge,
    isSubmitting,
    errorMessage,
    handleInputChange,
    handleNestedChange,
    handleAlertToggle,
    handleSubmit,
  } = usePatientFormModal(initialData, onSuccess, onClose);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className="flex items-center gap-2">
            <MaterialIcon name={initialData ? 'edit_note' : 'person_add'} size={24} color="#0d9488" />
            <h2 className={styles.title}>
              {initialData ? 'Modificar Ficha de Paciente' : 'Alta de Nuevo Paciente'}
            </h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className={styles.body}>
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200 text-xs flex items-center gap-2">
                <MaterialIcon name="error" size={18} color="#ef4444" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECCIÓN 1: DATOS PERSONALES */}
            <h3 className={styles.sectionTitle}>1. Datos Personales y Filiación</h3>
            <div className={styles.grid3}>
              <div className={styles.field}>
                <label className={styles.label}>Tipo Documento</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => handleInputChange('documentType', e.target.value)}
                  className={styles.select}
                >
                  <option value="DNI">DNI / Cédula</option>
                  <option value="PASAPORTE">Pasaporte</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Número de Documento *</label>
                <input
                  type="text"
                  value={formData.documentNumber}
                  onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                  className={styles.input}
                  required
                  placeholder="1728394012"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Sexo Biológico *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={styles.select}
                >
                  <option value="FEMENINO">Femenino</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Nombres *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={styles.input}
                  required
                  placeholder="María Elena"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Apellidos *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={styles.input}
                  required
                  placeholder="Salazar Rojas"
                />
              </div>
            </div>

            <div className={styles.grid3}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Fecha de Nacimiento * {calculatedAge !== null && `(${calculatedAge} años)`}
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Teléfono Móvil</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={styles.input}
                  placeholder="+593 99 876 5432"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={styles.input}
                  placeholder="paciente@correo.com"
                />
              </div>
            </div>

            {/* SECCIÓN TUTOR LEGAL OBLIGATORIO SI ES MENOR */}
            {isMinor && (
              <>
                <div className={styles.tutorAlert}>
                  <MaterialIcon name="info" size={20} color="#2563eb" />
                  <span>
                    Paciente menor de edad ({calculatedAge} años). La normativa sanitaria exige el registro
                    del tutor legal o representante.
                  </span>
                </div>

                <h3 className={styles.sectionTitle}>Tutor Legal / Representante Obligatorio</h3>
                <div className={styles.grid3}>
                  <div className={styles.field}>
                    <label className={styles.label}>Nombre del Tutor *</label>
                    <input
                      type="text"
                      value={formData.legalTutorData?.tutorName || ''}
                      onChange={(e) => handleNestedChange('legalTutorData', 'tutorName', e.target.value)}
                      className={styles.input}
                      required={isMinor}
                      placeholder="Carlos Salazar"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Documento del Tutor *</label>
                    <input
                      type="text"
                      value={formData.legalTutorData?.documentNumber || ''}
                      onChange={(e) => handleNestedChange('legalTutorData', 'documentNumber', e.target.value)}
                      className={styles.input}
                      required={isMinor}
                      placeholder="1710293847"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Teléfono del Tutor *</label>
                    <input
                      type="tel"
                      value={formData.legalTutorData?.phone || ''}
                      onChange={(e) => handleNestedChange('legalTutorData', 'phone', e.target.value)}
                      className={styles.input}
                      required={isMinor}
                      placeholder="+593 99 111 2233"
                    />
                  </div>
                </div>
              </>
            )}

            {/* SECCIÓN 2: ANTECEDENTES Y ALERTAS MÉDICAS CRÍTICAS */}
            <h3 className={styles.sectionTitle}>2. Anamnesis Médica y Alertas (Cifrado AES-256 LOPDP)</h3>

            <div className="flex flex-col gap-2">
              <label className={styles.label}>Alertas Médicas Críticas (Visibles en encabezado)</label>
              <div className={styles.alertsGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.criticalAlerts.includes('ALERGIA_PENICILINA')}
                    onChange={() => handleAlertToggle('ALERGIA_PENICILINA')}
                  />
                  <span>Alérgico a Penicilina</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.criticalAlerts.includes('ANTICOAGULADO')}
                    onChange={() => handleAlertToggle('ANTICOAGULADO')}
                  />
                  <span>Paciente Anticoagulado</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.criticalAlerts.includes('HIPERTENSION')}
                    onChange={() => handleAlertToggle('HIPERTENSION')}
                  />
                  <span>Hipertensión Arterial</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.criticalAlerts.includes('DIABETES')}
                    onChange={() => handleAlertToggle('DIABETES')}
                  />
                  <span>Diabetes Mellitus</span>
                </label>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Antecedentes Patológicos Sistémicos</label>
                <textarea
                  rows={3}
                  value={formData.pathologies || ''}
                  onChange={(e) => handleInputChange('pathologies', e.target.value)}
                  className={styles.textarea}
                  placeholder="Enfermedades preexistentes, cirugías previas, medicación actual..."
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Alergias a Fármacos y Sustancias</label>
                <textarea
                  rows={3}
                  value={formData.allergies || ''}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  className={styles.textarea}
                  placeholder="Reacciones adversas a anestésicos locales, analgésicos o látex..."
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.btnCancel} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <MaterialIcon name="progress_activity" size={18} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <MaterialIcon name="save" size={18} />
                  <span>{initialData ? 'Actualizar Ficha' : 'Guardar Paciente'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

