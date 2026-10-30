import React from 'react';
import styles from './DashboardView.module.css';
import { DashboardViewProps } from './DashboardView.types';
import { useDashboardView } from './useDashboardView';
import { MaterialIcon } from '../../../components/icons/MaterialIcon';

export const DashboardView: React.FC<DashboardViewProps> = () => {
  const {
    user,
    canWrite,
    canDelete,
    handleCreateAppointment,
    handleEmergencyAction,
  } = useDashboardView();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel de Control Principal</h1>
          <p className={styles.subtitle}>
            Bienvenido, {user ? `${user.firstName} ${user.lastName}` : 'Usuario'} • Rol:{' '}
            <span className="font-semibold text-teal-700">{user?.role}</span>
          </p>
        </div>

        {/* Acciones de la pantalla condicionadas por permisos booleanos */}
        <div className={styles.actions}>
          {/* Si escritura = false, este botón se oculta completamente del DOM */}
          {canWrite && (
            <button className={styles.btnPrimary} onClick={handleCreateAppointment}>
              <MaterialIcon name="add" size={20} />
              <span>Nueva Cita</span>
            </button>
          )}

          {/* Si borrado = false, este botón se oculta completamente del DOM */}
          {canDelete && (
            <button className={styles.btnDanger} onClick={handleEmergencyAction}>
              <MaterialIcon name="cancel" size={20} />
              <span>Anular Cita</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Métricas Operativas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <MaterialIcon name="event" size={28} />
          </div>
          <div>
            <div className={styles.statValue}>12</div>
            <div className={styles.statLabel}>Citas Programadas Hoy</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <MaterialIcon name="person" size={28} />
          </div>
          <div>
            <div className={styles.statValue}>3</div>
            <div className={styles.statLabel}>Pacientes en Sala</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <MaterialIcon name="chair" size={28} />
          </div>
          <div>
            <div className={styles.statValue}>3 / 3</div>
            <div className={styles.statLabel}>Sillones Operativos</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <MaterialIcon name="payments" size={28} />
          </div>
          <div>
            <div className={styles.statValue}>$ 840.00</div>
            <div className={styles.statLabel}>Recaudación Turno</div>
          </div>
        </div>
      </div>

      {/* Banner de Estado de Permisos Dinámicos */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
          <MaterialIcon name="admin_panel_settings" size={20} color="#0d9488" />
          Estado de Permisos Dinámicos Activos para este Módulo
        </h3>
        <div className="flex gap-4 text-xs font-medium">
          <span className="px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <MaterialIcon name="check_circle" size={16} /> Lectura: ACTIVA
          </span>
          <span
            className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 ${
              canWrite
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <MaterialIcon name={canWrite ? 'check_circle' : 'block'} size={16} />
            Escritura: {canWrite ? 'HABILITADA (Botones visibles)' : 'DENEGADA (Botones ocultos)'}
          </span>
          <span
            className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 ${
              canDelete
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <MaterialIcon name={canDelete ? 'check_circle' : 'block'} size={16} />
            Borrado: {canDelete ? 'HABILITADO (Botones visibles)' : 'DENEGADO (Botones ocultos)'}
          </span>
        </div>
      </div>
    </div>
  );
};

