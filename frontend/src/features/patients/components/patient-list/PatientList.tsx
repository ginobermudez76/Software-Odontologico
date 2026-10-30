import React from 'react';
import styles from './PatientList.module.css';
import { PatientListProps } from './PatientList.types';
import { usePatientList } from './usePatientList';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import { MedicalAlertBadge } from '../medical-alert-badge';
import { PatientFormModal } from '../patient-form-modal';

export const PatientList: React.FC<PatientListProps> = () => {
  const {
    patients,
    meta,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    isModalOpen,
    setIsModalOpen,
    editingPatient,
    handleOpenCreate,
    handleOpenEdit,
    handleDelete,
    refetch,
    canWrite,
    canDelete,
  } = usePatientList();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Filiación y Gestión de Pacientes</h1>
          <p className={styles.subtitle}>Registro único de pacientes, expediente clínico y alertas LOPDP</p>
        </div>

        {/* Botón Nuevo Paciente: Se oculta completamente si escritura = false */}
        {canWrite && (
          <button className={styles.btnPrimary} onClick={handleOpenCreate}>
            <MaterialIcon name="person_add" size={20} />
            <span>Nuevo Paciente</span>
          </button>
        )}
      </div>

      {/* Barra de Búsqueda Rápida */}
      <div className={styles.searchBar}>
        <MaterialIcon name="search" size={20} color="#94a3b8" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por DNI, nombres, apellidos o teléfono móvil..."
          className={styles.searchInput}
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600">
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla de Pacientes */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Documento / DNI</th>
              <th className={styles.th}>Nombre del Paciente</th>
              <th className={styles.th}>Edad / Sexo</th>
              <th className={styles.th}>Expediente</th>
              <th className={styles.th}>Alertas Médicas Críticas</th>
              <th className={styles.th}>Contacto</th>
              <th className={`${styles.th} text-right`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  <MaterialIcon name="progress_activity" size={24} className="animate-spin mb-2" />
                  <div>Cargando pacientes...</div>
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  <MaterialIcon name="person_off" size={32} color="#94a3b8" className="mb-2" />
                  <div>No se encontraron pacientes registrados con los criterios ingresados.</div>
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id} className={styles.row}>
                  <td className={styles.td}>
                    <span className="font-semibold text-slate-800">{patient.documentNumber}</span>
                    <span className="text-xs text-slate-400 block">{patient.documentType}</span>
                  </td>
                  <td className={styles.td}>
                    <div className="font-medium text-slate-900">{patient.fullName}</div>
                    <div className="text-xs text-slate-500">{patient.email || 'Sin correo'}</div>
                  </td>
                  <td className={styles.td}>
                    <span>{patient.age} años</span>
                    <span className="text-xs text-slate-400 block">{patient.gender}</span>
                  </td>
                  <td className={styles.td}>
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                      {patient.recordNumber || 'N/A'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <MedicalAlertBadge alerts={patient.visibleAlerts} />
                  </td>
                  <td className={styles.td}>
                    <span className="text-xs text-slate-600 block">{patient.phone || 'Sin teléfono'}</span>
                  </td>
                  <td className={`${styles.td} text-right`}>
                    <div className={`${styles.actions} justify-end`}>
                      {/* Botón Editar: Oculto si escritura = false */}
                      {canWrite && (
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleOpenEdit(patient)}
                          title="Modificar Ficha"
                        >
                          <MaterialIcon name="edit" size={18} />
                        </button>
                      )}

                      {/* Botón Eliminar: Oculto si borrado = false */}
                      {canDelete && (
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleDelete(patient)}
                          title="Eliminar Paciente (Soft Delete)"
                        >
                          <MaterialIcon name="delete" size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {meta && meta.totalPages > 1 && (
          <div className={styles.pagination}>
            <span className="text-xs text-slate-500">
              Página {meta.page} de {meta.totalPages} • Total: {meta.total} pacientes
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded border border-slate-200 text-xs font-medium disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded border border-slate-200 text-xs font-medium disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Alta / Edición de Paciente */}
      <PatientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
        initialData={editingPatient}
      />
    </div>
  );
};

