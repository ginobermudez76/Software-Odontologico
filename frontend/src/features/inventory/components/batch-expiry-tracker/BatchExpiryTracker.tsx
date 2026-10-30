import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './BatchExpiryTracker.module.css';
import { BatchExpiryTrackerProps, FilterAlert } from './BatchExpiryTracker.types';
import { useBatchExpiryTracker } from './useBatchExpiryTracker';
import { BatchAlertLevel } from '../../types/inventory.types';

export const BatchExpiryTracker: React.FC<BatchExpiryTrackerProps> = ({
  daysAhead = 60,
  onRefresh,
}) => {
  const {
    batches,
    allBatchesCount,
    isLoading,
    error,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    summary,
    refresh,
  } = useBatchExpiryTracker(daysAhead);

  const handleRefresh = () => {
    refresh();
    if (onRefresh) onRefresh();
  };

  const getBadgeClass = (alertLevel: BatchAlertLevel) => {
    switch (alertLevel) {
      case 'CADUCADO':
        return styles.badgeCaducado;
      case 'URGENTE_15_DIAS':
        return styles.badgeUrgente;
      case 'ALERTA_30_DIAS':
        return styles.badgeAlerta;
      case 'PREVENTIVO_60_DIAS':
        return styles.badgePreventivo;
    }
  };

  const getAlertLabel = (alertLevel: BatchAlertLevel) => {
    switch (alertLevel) {
      case 'CADUCADO':
        return 'Caducado';
      case 'URGENTE_15_DIAS':
        return 'Urgente (<15d)';
      case 'ALERTA_30_DIAS':
        return 'Alerta (<30d)';
      case 'PREVENTIVO_60_DIAS':
        return 'Preventivo (<60d)';
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerBar}>
        <div className={styles.titleGroup}>
          <MaterialIcon name="event_busy" size={24} />
          <div>
            <h2 className={styles.title}>Control de Vencimiento de Lotes</h2>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Monitoreo predictivo y orden de consumo clínico FEFO (First Expired, First Out)
            </div>
          </div>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <MaterialIcon name="refresh" size={16} />
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* FEFO Banner */}
      <div className={styles.fefoBanner}>
        <MaterialIcon name="verified" size={20} />
        <div>
          <strong>Política FEFO Activa:</strong> El sistema asigna automáticamente el lote más próximo a caducar para descargos por procedimientos clínicos, previniendo mermas y vencimientos.
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.cardCaducado}`}>
          <MaterialIcon name="cancel" size={28} />
          <div>
            <div className={styles.summaryCount}>{summary.caducados}</div>
            <div className={styles.summaryLabel}>Lotes Caducados</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardUrgente}`}>
          <MaterialIcon name="warning" size={28} />
          <div>
            <div className={styles.summaryCount}>{summary.urgente15}</div>
            <div className={styles.summaryLabel}>Crítico (&lt; 15 días)</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardAlerta}`}>
          <MaterialIcon name="schedule" size={28} />
          <div>
            <div className={styles.summaryCount}>{summary.alerta30}</div>
            <div className={styles.summaryLabel}>Alerta (&lt; 30 días)</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardPreventivo}`}>
          <MaterialIcon name="info" size={28} />
          <div>
            <div className={styles.summaryCount}>{summary.preventivo60}</div>
            <div className={styles.summaryLabel}>Preventivo (&lt; 60 días)</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.filterChips}>
          <button
            type="button"
            className={`${styles.chip} ${filter === 'TODOS' ? styles.chipActive : ''}`}
            onClick={() => setFilter('TODOS')}
          >
            Todos ({allBatchesCount})
          </button>
          <button
            type="button"
            className={`${styles.chip} ${filter === 'CADUCADO' ? styles.chipActive : ''}`}
            onClick={() => setFilter('CADUCADO')}
          >
            Caducados ({summary.caducados})
          </button>
          <button
            type="button"
            className={`${styles.chip} ${filter === 'URGENTE_15_DIAS' ? styles.chipActive : ''}`}
            onClick={() => setFilter('URGENTE_15_DIAS')}
          >
            &lt; 15 días ({summary.urgente15})
          </button>
          <button
            type="button"
            className={`${styles.chip} ${filter === 'ALERTA_30_DIAS' ? styles.chipActive : ''}`}
            onClick={() => setFilter('ALERTA_30_DIAS')}
          >
            &lt; 30 días ({summary.alerta30})
          </button>
          <button
            type="button"
            className={`${styles.chip} ${filter === 'PREVENTIVO_60_DIAS' ? styles.chipActive : ''}`}
            onClick={() => setFilter('PREVENTIVO_60_DIAS')}
          >
            &lt; 60 días ({summary.preventivo60})
          </button>
        </div>

        <input
          type="text"
          className={styles.searchInput}
          placeholder="Filtrar por lote, insumo o SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#991b1b', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Table */}
      {batches.length === 0 ? (
        <div className={styles.emptyState}>
          <MaterialIcon name="check_circle" size={40} />
          <strong>No hay lotes que requieran atención en este rango</strong>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Todos los insumos clínicos en inventario cuentan con fechas de caducidad óptimas.
          </p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Insumo Clínico</th>
                <th>SKU</th>
                <th>N° Lote</th>
                <th>Fecha Vencimiento</th>
                <th>Días Restantes</th>
                <th>Disponible</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id}>
                  <td>
                    <span className={`${styles.badge} ${getBadgeClass(b.alertLevel)}`}>
                      <MaterialIcon
                        name={b.alertLevel === 'CADUCADO' ? 'block' : 'timer'}
                        size={14}
                      />
                      {getAlertLabel(b.alertLevel)}
                    </span>
                  </td>
                  <td>
                    <strong>{b.supplyName}</strong>
                  </td>
                  <td>
                    <code>{b.supplySku}</code>
                  </td>
                  <td>
                    <code>{b.batchNumber}</code>
                  </td>
                  <td>{new Date(b.expirationDate).toLocaleDateString()}</td>
                  <td>
                    <strong style={{ color: b.daysRemaining <= 0 ? '#dc2626' : '#ea580c' }}>
                      {b.daysRemaining <= 0
                        ? `Venció hace ${Math.abs(b.daysRemaining)} d`
                        : `${b.daysRemaining} días`}
                    </strong>
                  </td>
                  <td>
                    {b.availableQuantity} {b.unit}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
