import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import { BlindCloseModalProps } from './BlindCloseModal.types';
import { useBlindCloseModal } from './useBlindCloseModal';
import styles from './BlindCloseModal.module.css';

export const BlindCloseModal: React.FC<BlindCloseModalProps> = (props) => {
  const { isOpen, onClose, shift } = props;
  const {
    declaredAmount,
    setDeclaredAmount,
    notes,
    setNotes,
    isSubmitting,
    errorMessage,
    reconciliationResult,
    handleSubmit,
    handleFinish,
  } = useBlindCloseModal(props);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        {/* Cabecera */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <MaterialIcon name="point_of_sale" className={styles.titleIcon} />
            <h2 className={styles.title}>Arqueo & Cierre Ciego de Caja</h2>
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

        {/* Notificación de protocolo ciego */}
        {!reconciliationResult && (
          <div className={styles.noticeBox}>
            <MaterialIcon name="visibility_off" className={styles.noticeIcon} />
            <p>
              <strong>Protocolo de Cierre Ciego:</strong> Por normativa de seguridad y auditoría interna,
              los montos esperados por el sistema no se revelan antes del conteo físico. Ingrese el total
              de dinero en efectivo existente en la gaveta.
            </p>
          </div>
        )}

        {/* Si ya se cerró, mostrar Acta de Cierre */}
        {reconciliationResult ? (
          <div className={styles.actaContainer}>
            <div className={styles.actaHeader}>
              <MaterialIcon name="verified" className={styles.titleIcon} />
              <h3 className="font-bold text-slate-800 text-lg">Acta Inmutable de Cierre Generada</h3>
            </div>

            <div className={styles.actaRows}>
              <div className={styles.actaRow}>
                <span>Fondo Fijo de Apertura:</span>
                <strong>${reconciliationResult.openingBalance.toFixed(2)}</strong>
              </div>
              <div className={styles.actaRow}>
                <span>Cobros Efectivo del Turno:</span>
                <strong>${reconciliationResult.totalCashCollected.toFixed(2)}</strong>
              </div>
              <div className={styles.actaRow}>
                <span>Cobros Electrónicos (Tarjeta/Transf.):</span>
                <strong>${reconciliationResult.totalElectronicCollected.toFixed(2)}</strong>
              </div>
              <div className={styles.actaRow}>
                <span>Saldo Teórico Esperado en Gaveta:</span>
                <strong>${reconciliationResult.theoreticalCashBalance.toFixed(2)}</strong>
              </div>
              <div className={styles.actaRow}>
                <span>Monto Físico Declarado por Cajero:</span>
                <strong>${reconciliationResult.declaredPhysicalBalance.toFixed(2)}</strong>
              </div>

              <div className={styles.actaRowHighlight}>
                <span>Diferencia / Discrepancia:</span>
                <span
                  className={
                    reconciliationResult.discrepancy === 0
                      ? styles.statusExacto
                      : reconciliationResult.discrepancy > 0
                      ? styles.statusSobrante
                      : styles.statusFaltante
                  }
                >
                  ${reconciliationResult.discrepancy.toFixed(2)} ({reconciliationResult.discrepancyType})
                </span>
              </div>
            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.btnSubmit} onClick={handleFinish}>
                <MaterialIcon name="check" />
                <span>Finalizar y Salir</span>
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Cierre Ciego */
          <form onSubmit={handleSubmit} className={styles.form}>
            {errorMessage && (
              <div className={styles.errorAlert} role="alert">
                <MaterialIcon name="error" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="declaredAmount">
                Conteo Físico Total en Efectivo <span className={styles.required}>*</span>
              </label>
              <div className={styles.currencyInputWrapper}>
                <span className={styles.currencyPrefix}>$</span>
                <input
                  id="declaredAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={declaredAmount}
                  onChange={(e) => setDeclaredAmount(e.target.value)}
                  placeholder="0.00"
                  className={styles.inputCurrency}
                  required
                  autoFocus
                />
              </div>
              <span className="text-xs text-slate-500">
                Sume billetes, monedas y fondo fijo de apertura en el cajón.
              </span>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="notes">
                Observaciones del Arqueo
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Indique novedades, billetes deteriorados o aclaraciones..."
                className={styles.textarea}
              />
            </div>

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
                <MaterialIcon name={isSubmitting ? 'sync' : 'lock'} />
                <span>{isSubmitting ? 'Procesando Cierre...' : 'Cerrar Turno a Ciegas'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

