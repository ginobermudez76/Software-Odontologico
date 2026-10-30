import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './InventoryList.module.css';
import { InventoryListProps } from './InventoryList.types';
import { useInventoryList } from './useInventoryList';

export const InventoryList: React.FC<InventoryListProps> = ({
  canWrite = true,
  onSupplyCreated,
}) => {
  const {
    supplies,
    searchTerm,
    setSearchTerm,
    isLoading,
    isSubmitting,
    feedback,
    newModal,
    setNewModal,
    batchModal,
    setBatchModal,
    openNewSupplyModal,
    closeNewSupplyModal,
    submitNewSupply,
    openAddBatchModal,
    closeAddBatchModal,
    submitAddBatch,
  } = useInventoryList(onSupplyCreated);

  return (
    <div className={styles.container}>
      {/* Header bar */}
      <header className={styles.headerBar}>
        <div className={styles.titleGroup}>
          <MaterialIcon name="inventory_2" size={24} />
          <div>
            <h2 className={styles.title}>Inventario Clínico y Almacén</h2>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Control de stock, insumos odontológicos y lotes por sillón
            </div>
          </div>
        </div>

        <div className={styles.controlsGroup}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {canWrite && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={openNewSupplyModal}
            >
              <MaterialIcon name="add" size={18} />
              Nuevo Insumo
            </button>
          )}
        </div>
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

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Insumo</th>
                <th>Marca</th>
                <th>Unidad</th>
                <th>Stock Mín.</th>
                <th>Stock Actual</th>
                <th>Estado</th>
                <th>Lotes Activos</th>
                <th>Próxima Caducidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    <MaterialIcon name="sync" size={24} className="animate-spin" />
                    <span style={{ marginLeft: '0.5rem' }}>Cargando inventario...</span>
                  </td>
                </tr>
              ) : supplies.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No se encontraron insumos clínicos en inventario.
                  </td>
                </tr>
              ) : (
                supplies.map((supply) => {
                  let statusClass = styles.statusOptimo;
                  let statusText = 'Óptimo';
                  if (supply.stockStatus === 'CRITICO') {
                    statusClass = styles.statusCritico;
                    statusText = 'Agotado / Crítico';
                  } else if (supply.stockStatus === 'BAJO') {
                    statusClass = styles.statusBajo;
                    statusText = 'Stock Bajo';
                  }

                  return (
                    <tr key={supply.id}>
                      <td className={styles.skuCell}>{supply.sku}</td>
                      <td>
                        <div className={styles.supplyName}>{supply.name}</div>
                      </td>
                      <td>{supply.brand || '-'}</td>
                      <td>{supply.unit}</td>
                      <td>{supply.minStock}</td>
                      <td style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{supply.currentStock}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${statusClass}`}>
                          {statusText}
                        </span>
                      </td>
                      <td>{supply.activeBatchesCount}</td>
                      <td>
                        {supply.nextExpiringBatch ? (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: (supply.nextExpirationDays ?? 999) <= 30 ? '#dc2626' : '#475569',
                              fontWeight: (supply.nextExpirationDays ?? 999) <= 30 ? 700 : 400,
                            }}
                          >
                            {supply.nextExpiringBatch.batchNumber} (en {supply.nextExpirationDays} días)
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Sin lotes</span>
                        )}
                      </td>
                      <td>
                        {canWrite && (
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => openAddBatchModal(supply)}
                            title="Ingresar nuevo lote de este insumo"
                          >
                            <MaterialIcon name="add_box" size={14} />
                            + Lote
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Supply Modal */}
      {newModal.isOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <header className={styles.modalHeader}>
              <span>Registrar Nuevo Insumo Clínico</span>
              <button
                type="button"
                onClick={closeNewSupplyModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Código SKU Único</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Ej. INS-ANES-01"
                  value={newModal.sku}
                  onChange={(e) =>
                    setNewModal((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre Comercial del Insumo</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Ej. Lidocaína 2% con Epinefrina"
                  value={newModal.name}
                  onChange={(e) =>
                    setNewModal((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Marca / Fabricante (Opcional)</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Ej. Septodont / 3M"
                  value={newModal.brand}
                  onChange={(e) =>
                    setNewModal((prev) => ({ ...prev, brand: e.target.value }))
                  }
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Unidad de Medida</label>
                  <select
                    className={styles.inputField}
                    value={newModal.unit}
                    onChange={(e) =>
                      setNewModal((prev) => ({ ...prev, unit: e.target.value }))
                    }
                  >
                    <option value="Cartucho">Cartucho</option>
                    <option value="Gramo">Gramo</option>
                    <option value="Unidad">Unidad</option>
                    <option value="Par">Par</option>
                    <option value="Frasco">Frasco</option>
                    <option value="Caja">Caja</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Stock Mínimo de Seguridad</label>
                  <input
                    type="number"
                    className={styles.inputField}
                    value={newModal.minStock}
                    onChange={(e) =>
                      setNewModal((prev) => ({ ...prev, minStock: Number(e.target.value) }))
                    }
                    min={0}
                  />
                </div>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeNewSupplyModal}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={submitNewSupply}
                disabled={isSubmitting}
              >
                <MaterialIcon name={isSubmitting ? 'sync' : 'save'} size={18} />
                {isSubmitting ? 'Guardando...' : 'Crear Insumo'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      {batchModal.isOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <header className={styles.modalHeader}>
              <span>Ingreso de Lote: {batchModal.supplyName}</span>
              <button
                type="button"
                onClick={closeAddBatchModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Número de Lote (Fabricante)</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Ej. LOT-2026-X89"
                  value={batchModal.batchNumber}
                  onChange={(e) =>
                    setBatchModal((prev) => ({ ...prev, batchNumber: e.target.value }))
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Fecha de Caducidad / Vencimiento</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={batchModal.expirationDate}
                  onChange={(e) =>
                    setBatchModal((prev) => ({ ...prev, expirationDate: e.target.value }))
                  }
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Cantidad a Ingresar</label>
                  <input
                    type="number"
                    className={styles.inputField}
                    value={batchModal.quantity}
                    onChange={(e) =>
                      setBatchModal((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                    }
                    min={1}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Costo Unitario ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={styles.inputField}
                    value={batchModal.unitCost}
                    onChange={(e) =>
                      setBatchModal((prev) => ({ ...prev, unitCost: Number(e.target.value) }))
                    }
                    min={0}
                  />
                </div>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeAddBatchModal}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={submitAddBatch}
                disabled={isSubmitting}
              >
                <MaterialIcon name={isSubmitting ? 'sync' : 'add_box'} size={18} />
                {isSubmitting ? 'Ingresando Lote...' : 'Ingresar Lote al Stock'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

