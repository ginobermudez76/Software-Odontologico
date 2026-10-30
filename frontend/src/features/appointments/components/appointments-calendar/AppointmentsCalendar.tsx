import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import { AppointmentStatusBadge } from '../appointment-status-badge';
import { AppointmentFormModal } from '../appointment-form-modal';
import { AppointmentsCalendarProps } from './AppointmentsCalendar.types';
import { useAppointmentsCalendar } from './useAppointmentsCalendar';
import { AppointmentStatus } from '../../types/appointment.types';
import styles from './AppointmentsCalendar.module.css';

export const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({ initialDate }) => {
  const {
    branchId,
    viewMode,
    setViewMode,
    currentDate,
    chairFilter,
    setChairFilter,
    statusFilter,
    setStatusFilter,
    appointments,
    chairs,
    isLoading,
    isModalOpen,
    selectedAppointment,
    canWrite,
    canDelete,
    navigateDate,
    setToday,
    handleStatusChange,
    handleDeleteAppointment,
    handleOpenNewModal,
    handleOpenEditModal,
    handleModalClose,
    handleModalSuccess,
  } = useAppointmentsCalendar(initialDate);

  const formattedDateHeader = new Date(`${currentDate}T12:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.container}>
      {/* Barra superior con título y botón de acción */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <MaterialIcon name="calendar_month" className={styles.titleIcon} />
          <div>
            <h1 className={styles.title}>Agenda Clínica Multirrecinto</h1>
            <p className={styles.subtitle}>
              Control de citas por sillón dental físico con prevención anti-colisión
            </p>
          </div>
        </div>

        <div className={styles.actionsArea}>
          <div className={styles.viewSelector}>
            <button
              type="button"
              className={`${styles.viewButton} ${viewMode === 'day' ? styles.viewButtonActive : ''}`}
              onClick={() => setViewMode('day')}
            >
              <MaterialIcon name="view_day" />
              <span>Día</span>
            </button>
            <button
              type="button"
              className={`${styles.viewButton} ${viewMode === 'chair' ? styles.viewButtonActive : ''}`}
              onClick={() => setViewMode('chair')}
            >
              <MaterialIcon name="meeting_room" />
              <span>Sillones</span>
            </button>
          </div>

          {/* Botón Nueva Cita: se oculta si canWrite = false */}
          {canWrite && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleOpenNewModal}
              data-testid="btn-new-appointment"
            >
              <MaterialIcon name="add" />
              <span>Nueva Cita</span>
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas de estado en vivo de sillones físicos */}
      <div className={styles.chairsGrid}>
        {chairs.map((chair) => {
          const state = chair.occupancyState || 'DISPONIBLE';
          let stateClass = styles.stateDisponible;
          let stateIcon = 'check_circle';

          if (state === 'OCUPADO') {
            stateClass = styles.stateOcupado;
            stateIcon = 'cancel';
          } else if (state === 'RESERVADO') {
            stateClass = styles.stateReservado;
            stateIcon = 'schedule';
          } else if (state === 'MANTENIMIENTO') {
            stateClass = styles.stateMantenimiento;
            stateIcon = 'build';
          }

          return (
            <div key={chair.id} className={styles.chairCard}>
              <div className={styles.chairCardHeader}>
                <span className={styles.chairName}>{chair.name}</span>
                <span className={styles.chairCode}>{chair.code}</span>
              </div>
              <div className={`${styles.chairStatus} ${stateClass}`}>
                <MaterialIcon name={stateIcon} />
                <span>Estado: {state}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controles de navegación de fecha y filtros */}
      <div className={styles.controlsRow}>
        <div className={styles.dateNav}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => navigateDate(-1)}
            aria-label="Día anterior"
          >
            <MaterialIcon name="chevron_left" />
          </button>
          <button type="button" className={styles.navButton} onClick={setToday}>
            Hoy
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => navigateDate(1)}
            aria-label="Día siguiente"
          >
            <MaterialIcon name="chevron_right" />
          </button>
          <span className={styles.currentDateLabel}>{formattedDateHeader}</span>
        </div>

        <div className={styles.filtersGroup}>
          <select
            value={chairFilter}
            onChange={(e) => setChairFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="ALL">Todos los sillones</option>
            {chairs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="ALL">Todos los estados</option>
            <option value="PROGRAMADO">Programado</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="EN_SALA">En Sala de Espera</option>
            <option value="EN_ATENCION">En Atención</option>
            <option value="ATENDIDO">Atendido</option>
            <option value="CANCELADO">Cancelado</option>
            <option value="NO_SHOW">No Asistió</option>
          </select>
        </div>
      </div>

      {/* Listado de citas del día */}
      {isLoading ? (
        <div className={styles.emptyState}>
          <MaterialIcon name="sync" className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Cargando cronograma clínico...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className={styles.emptyState}>
          <MaterialIcon name="event_busy" className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No hay citas programadas para esta fecha y filtros</p>
          <p className={styles.emptyDesc}>
            Seleccione otro día o utilice el botón "Nueva Cita" para agendar.
          </p>
        </div>
      ) : (
        <div className={styles.appointmentsList}>
          {appointments.map((apt) => {
            const startTime = new Date(apt.startDateTime).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const endTime = new Date(apt.endDateTime).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={apt.id} className={styles.appointmentCard}>
                {/* Horario y Sillón */}
                <div className={styles.timeCol}>
                  <span className={styles.timeRange}>
                    {startTime} - {endTime}
                  </span>
                  <span className={styles.chairBadge}>
                    <MaterialIcon name="chair" />
                    {apt.chair?.name}
                  </span>
                </div>

                {/* Paciente */}
                <div className={styles.patientCol}>
                  <span className={styles.patientName}>
                    {apt.patient?.lastName}, {apt.patient?.firstName}
                  </span>
                  <span className={styles.patientDoc}>
                    {apt.patient?.documentType}: {apt.patient?.documentNumber} | Tel: {apt.patient?.phone || 'S/N'}
                  </span>
                </div>

                {/* Profesional y Motivo */}
                <div className={styles.doctorCol}>
                  <span className={styles.doctorName}>
                    Dr.(a) {apt.doctor?.firstName} {apt.doctor?.lastName}
                  </span>
                  <span className={styles.reasonText}>
                    {apt.reason || 'Consulta general odontológica'}
                  </span>
                </div>

                {/* Estado y Tiempo de Espera */}
                <div className={styles.statusCol}>
                  <AppointmentStatusBadge status={apt.status} />
                  {apt.status === 'EN_SALA' && (
                    <span className={styles.waitingMinutesBadge}>
                      <MaterialIcon name="timer" />
                      Espera: {apt.waitingMinutes} min
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <div className={styles.actionsCol}>
                  {/* Selector rápido de estado (solo si canWrite = true) */}
                  {canWrite && (
                    <select
                      value={apt.status}
                      onChange={(e) =>
                        handleStatusChange(apt.id, e.target.value as AppointmentStatus)
                      }
                      className={styles.statusDropdown}
                      aria-label="Cambiar estado de cita"
                    >
                      <option value="PROGRAMADO">Programado</option>
                      <option value="CONFIRMADO">Confirmado</option>
                      <option value="EN_SALA">Pasar a Sala de Espera</option>
                      <option value="EN_ATENCION">Iniciar Atención</option>
                      <option value="ATENDIDO">Finalizar (Atendido)</option>
                      <option value="CANCELADO">Cancelar Cita</option>
                      <option value="NO_SHOW">No Asistió (No-Show)</option>
                    </select>
                  )}

                  {/* Botón editar / reprogramar: visible si canWrite = true */}
                  {canWrite && (
                    <button
                      type="button"
                      className={styles.btnActionIcon}
                      onClick={() => handleOpenEditModal(apt)}
                      title="Reprogramar cita"
                      aria-label="Reprogramar cita"
                    >
                      <MaterialIcon name="edit_calendar" />
                    </button>
                  )}

                  {/* Botón eliminar: visible si canDelete = true */}
                  {canDelete && (
                    <button
                      type="button"
                      className={`${styles.btnActionIcon} ${styles.btnDelete}`}
                      onClick={() => handleDeleteAppointment(apt.id)}
                      title="Eliminar cita"
                      aria-label="Eliminar cita"
                    >
                      <MaterialIcon name="delete" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Agendamiento / Reprogramación */}
      <AppointmentFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        initialAppointment={selectedAppointment}
        chairs={chairs}
        branchId={branchId}
      />
    </div>
  );
};
