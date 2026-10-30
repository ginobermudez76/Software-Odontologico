import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import { AppointmentFormModalProps } from './AppointmentFormModal.types';
import { useAppointmentFormModal } from './useAppointmentFormModal';
import styles from './AppointmentFormModal.module.css';

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = (props) => {
  const { isOpen, onClose, initialAppointment, chairs } = props;
  const {
    formData,
    patients,
    doctors,
    isLoadingPatients,
    isSubmitting,
    errorMessage,
    handleChange,
    handleSubmit,
  } = useAppointmentFormModal(props);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        {/* Cabecera */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <MaterialIcon name="event" className={styles.titleIcon} />
            <h2 className={styles.title}>
              {initialAppointment ? 'Reprogramar / Modificar Cita' : 'Agendar Nueva Cita'}
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {errorMessage && (
            <div className={styles.errorAlert} role="alert">
              <MaterialIcon name="error" className={styles.errorIcon} />
              <div>
                <strong>Aviso de Conflicto de Agenda:</strong>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Paciente */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="patientId">
              Paciente <span className={styles.required}>*</span>
            </label>
            <select
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className={styles.select}
              required
              disabled={isLoadingPatients || !!initialAppointment}
            >
              <option value="">-- Seleccione un paciente --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lastName}, {p.firstName} (Doc: {p.documentNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Odontólogo y Sillón */}
          <div className={styles.twoColumns}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="doctorId">
                Odontólogo Tratante <span className={styles.required}>*</span>
              </label>
              <select
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className={styles.select}
                required
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="chairId">
                Sillón Dental Físico <span className={styles.required}>*</span>
              </label>
              <select
                id="chairId"
                name="chairId"
                value={formData.chairId}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">-- Seleccione sillón --</option>
                {chairs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha y Horario */}
          <div className={styles.threeColumns}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="date">
                Fecha de Atención <span className={styles.required}>*</span>
              </label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="startTime">
                Hora Inicio <span className={styles.required}>*</span>
              </label>
              <input
                id="startTime"
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="endTime">
                Hora Fin <span className={styles.required}>*</span>
              </label>
              <input
                id="endTime"
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          {/* Motivo */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="reason">
              Motivo de Consulta / Procedimiento Proyectado
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Ej. Evaluación inicial, profilaxis, exodoncia pieza 4.8..."
              className={styles.textarea}
            />
          </div>

          {/* Botones de acción */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
              <MaterialIcon name={isSubmitting ? 'sync' : 'check'} />
              <span>{isSubmitting ? 'Guardando...' : 'Confirmar Cita'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
