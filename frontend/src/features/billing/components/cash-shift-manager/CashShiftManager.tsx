import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import { BlindCloseModal } from '../blind-close-modal';
import { useCashShiftManager } from './useCashShiftManager';
import styles from './CashShiftManager.module.css';

export const CashShiftManager: React.FC = () => {
  const {
    currentShift,
    shiftHistory,
    isLoading,
    isOpeningShift,
    openingBalance,
    setOpeningBalance,
    openingNotes,
    setOpeningNotes,
    isBlindModalOpen,
    setIsBlindModalOpen,
    errorMessage,
    canWrite,
    handleOpenShift,
    handleBlindCloseSuccess,
  } = useCashShiftManager();

  return (
    <div className={styles.container}>
      {/* Barra superior */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <MaterialIcon name="point_of_sale" className={styles.titleIcon} />
          <div>
            <h1 className={styles.title}>Control de Arqueo y Cierre Ciego de Caja</h1>
            <p className={styles.subtitle}>
              Gestión de turnos de cobro, fondo fijo y conciliación fiscal inmutable
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-2">
          <MaterialIcon name="error" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Card de Estado del Turno Actual */}
      <div className={styles.shiftStatusCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <MaterialIcon name="badge" />
            <span>Turno Operativo de Caja</span>
          </div>

          {currentShift ? (
            <span className={styles.statusPillOpen}>
              <MaterialIcon name="radio_button_checked" />
              <span>CAJA ABIERTA</span>
            </span>
          ) : (
            <span className={styles.statusPillClosed}>
              <MaterialIcon name="lock" />
              <span>CAJA CERRADA</span>
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Cargando estado de caja...</div>
        ) : currentShift ? (
          <>
            <div className={styles.shiftInfoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Sede Operativa</span>
                <span className={styles.infoValue}>{currentShift.branchName || 'Sede Central'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Hora de Apertura</span>
                <span className={styles.infoValue}>
                  {new Date(currentShift.openingTime).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Fondo Fijo Inicial</span>
                <span className={styles.infoValue}>
                  ${Number(currentShift.openingBalance).toFixed(2)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Protocolo de Cierre</span>
                <span className="text-amber-700 text-sm font-semibold flex items-center gap-1">
                  <MaterialIcon name="visibility_off" />
                  Ciego (Auditoría LOPDP)
                </span>
              </div>
            </div>

            {canWrite && (
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.btnWarning}
                  onClick={() => setIsBlindModalOpen(true)}
                  data-testid="btn-blind-close"
                >
                  <MaterialIcon name="lock" />
                  <span>Realizar Cierre Ciego de Turno</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Formulario para abrir caja si canWrite = true */
          <div>
            <p className="text-slate-600 mb-4 text-sm">
              No existe un turno activo para su usuario. Ingrese el fondo fijo en efectivo entregado para abrir caja:
            </p>

            {canWrite ? (
              <form onSubmit={handleOpenShift} className={styles.openShiftForm}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="openingBalance">
                    Fondo Fijo de Apertura ($)
                  </label>
                  <input
                    id="openingBalance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="openingNotes">
                    Observaciones / Caja Asignada
                  </label>
                  <input
                    id="openingNotes"
                    type="text"
                    value={openingNotes}
                    onChange={(e) => setOpeningNotes(e.target.value)}
                    placeholder="Ej. Caja 1 - Turno Mañana"
                    className={styles.input}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={isOpeningShift}
                  data-testid="btn-open-shift"
                >
                  <MaterialIcon name={isOpeningShift ? 'sync' : 'key'} />
                  <span>{isOpeningShift ? 'Abriendo Caja...' : 'Iniciar Turno de Cobro'}</span>
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded text-slate-500 text-sm">
                No tiene permisos de apertura de caja.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Historial de Turnos y Auditoría */}
      <div className={styles.historySection}>
        <h2 className={styles.historyTitle}>Historial de Turnos y Auditoría de Arqueo</h2>

        {shiftHistory.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay registros de turnos previos para esta sede.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Apertura</th>
                  <th className={styles.th}>Cierre</th>
                  <th className={styles.th}>Fondo Apertura</th>
                  <th className={styles.th}>Físico Declarado</th>
                  <th className={styles.th}>Saldo Teórico</th>
                  <th className={styles.th}>Discrepancia</th>
                  <th className={styles.th}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {shiftHistory.map((s) => {
                  const disc = s.discrepancy !== null ? Number(s.discrepancy) : 0;
                  return (
                    <tr key={s.id}>
                      <td className={styles.td}>
                        {new Date(s.openingTime).toLocaleDateString()} {new Date(s.openingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className={styles.td}>
                        {s.closingTime
                          ? `${new Date(s.closingTime).toLocaleDateString()} ${new Date(s.closingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'En curso'}
                      </td>
                      <td className={styles.td}>${Number(s.openingBalance).toFixed(2)}</td>
                      <td className={styles.td}>
                        {s.declaredPhysicalBalance !== null
                          ? `$${Number(s.declaredPhysicalBalance).toFixed(2)}`
                          : '-'}
                      </td>
                      <td className={styles.td}>
                        {s.theoreticalBalance !== null
                          ? `$${Number(s.theoreticalBalance).toFixed(2)}`
                          : '-'}
                      </td>
                      <td className={styles.td}>
                        {s.discrepancy !== null ? (
                          <span
                            className={
                              disc === 0
                                ? 'text-green-600 font-bold'
                                : disc > 0
                                ? 'text-blue-600 font-bold'
                                : 'text-red-600 font-bold'
                            }
                          >
                            ${disc.toFixed(2)} {disc === 0 ? '(Exacto)' : disc > 0 ? '(Sobrante)' : '(Faltante)'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className={styles.td}>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cierre Ciego */}
      {currentShift && (
        <BlindCloseModal
          isOpen={isBlindModalOpen}
          onClose={() => setIsBlindModalOpen(false)}
          onSuccess={handleBlindCloseSuccess}
          shift={currentShift}
        />
      )}
    </div>
  );
};
