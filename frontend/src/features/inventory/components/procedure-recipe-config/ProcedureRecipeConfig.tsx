import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './ProcedureRecipeConfig.module.css';
import { ProcedureRecipeConfigProps } from './ProcedureRecipeConfig.types';
import { useProcedureRecipeConfig } from './useProcedureRecipeConfig';

const DEFAULT_PROCEDURES = [
  { id: 'proc-1', code: 'PRO-001', name: 'Profilaxis y Destartraje Supragingival', category: 'PREVENTIVA' },
  { id: 'proc-2', code: 'RES-001', name: 'Restauración con Resina Compuesta 1 Superficie', category: 'OPERATORIA' },
  { id: 'proc-3', code: 'ENDO-001', name: 'Endodoncia Unirradicular', category: 'ENDODONCIA' },
  { id: 'proc-4', code: 'CIR-001', name: 'Exodoncia Simple de Diente Permanente', category: 'CIRUGIA' },
];

export const ProcedureRecipeConfig: React.FC<ProcedureRecipeConfigProps> = ({
  canWrite = true,
  procedures = DEFAULT_PROCEDURES,
  onRecipeSaved,
}) => {
  const {
    availableSupplies,
    selectedProcedureId,
    setSelectedProcedureId,
    recipeItems,
    isLoading,
    isSaving,
    feedback,
    selectedSupplyToAdd,
    setSelectedSupplyToAdd,
    quantityToAdd,
    setQuantityToAdd,
    addSupplyItem,
    removeSupplyItem,
    updateQuantity,
    saveRecipe,
  } = useProcedureRecipeConfig(procedures, onRecipeSaved);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerBar}>
        <div className={styles.titleGroup}>
          <MaterialIcon name="receipt_long" size={24} />
          <div>
            <h2 className={styles.title}>Recetas Clínicas y Descargo por Procedimiento</h2>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Configuración de consumos automáticos de insumos al atender cada procedimiento odontológico
            </div>
          </div>
        </div>
      </div>

      {/* Procedure Selector */}
      <div className={styles.selectorSection}>
        <label className={styles.label} htmlFor="procedure-select">
          Seleccionar Procedimiento Odontológico:
        </label>
        <select
          id="procedure-select"
          className={styles.selectInput}
          value={selectedProcedureId}
          onChange={(e) => setSelectedProcedureId(e.target.value)}
        >
          {procedures.map((p) => (
            <option key={p.id} value={p.id}>
              [{p.code}] {p.name} ({p.category})
            </option>
          ))}
        </select>
      </div>

      {feedback && (
        <div
          className={
            feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError
          }
        >
          <MaterialIcon
            name={feedback.type === 'success' ? 'check_circle' : 'error'}
            size={18}
          />
          {feedback.message}
        </div>
      )}

      {/* Add Supply Box (Only if canWrite === true) */}
      {canWrite && (
        <div className={styles.addSupplyBox}>
          <div className={styles.formField} style={{ flex: 1, minWidth: '220px' }}>
            <label className={styles.label}>Insumo Clínico:</label>
            <select
              className={styles.selectInput}
              value={selectedSupplyToAdd}
              onChange={(e) => setSelectedSupplyToAdd(e.target.value)}
            >
              <option value="">-- Seleccionar Insumo --</option>
              {availableSupplies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.unit}) - Stock: {s.currentStock}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Cantidad:</label>
            <input
              type="number"
              step="0.1"
              min="0.01"
              className={styles.inputNumber}
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(parseFloat(e.target.value) || 0)}
            />
          </div>

          <button
            type="button"
            className={styles.addButton}
            onClick={addSupplyItem}
            disabled={!selectedSupplyToAdd || quantityToAdd <= 0}
          >
            <MaterialIcon name="add" size={18} />
            Agregar a Receta
          </button>
        </div>
      )}

      {/* Supplies Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          Cargando receta del procedimiento...
        </div>
      ) : recipeItems.length === 0 ? (
        <div className={styles.emptyState}>
          <MaterialIcon name="medical_services" size={40} />
          <strong>Sin insumos configurados para este procedimiento</strong>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Agregue los insumos necesarios para que el descargo automático de stock funcione al cerrar la cita clínica.
          </p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Insumo Clínico</th>
                <th>SKU</th>
                <th>Cantidad Estándar</th>
                <th>Unidad de Medida</th>
                {canWrite && <th style={{ textAlign: 'right' }}>Acción</th>}
              </tr>
            </thead>
            <tbody>
              {recipeItems.map((item) => (
                <tr key={item.supplyId}>
                  <td>
                    <strong>{item.supplyName}</strong>
                  </td>
                  <td>
                    <code>{item.supplySku || 'N/A'}</code>
                  </td>
                  <td>
                    {canWrite ? (
                      <input
                        type="number"
                        step="0.1"
                        min="0.01"
                        className={styles.qtyInput}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.supplyId,
                            parseFloat(e.target.value) || item.quantity,
                          )
                        }
                      />
                    ) : (
                      <span>{item.quantity}</span>
                    )}
                  </td>
                  <td>{item.unit}</td>
                  {canWrite && (
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeSupplyItem(item.supplyId)}
                      >
                        <MaterialIcon name="delete" size={16} />
                        Quitar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Save Button (Only if canWrite === true) */}
      {canWrite && recipeItems.length > 0 && (
        <button
          type="button"
          className={styles.saveButton}
          onClick={saveRecipe}
          disabled={isSaving}
        >
          <MaterialIcon name="save" size={18} />
          {isSaving ? 'Guardando Receta...' : 'Guardar Receta Clínica'}
        </button>
      )}
    </div>
  );
};
