import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './InventoryView.module.css';
import { InventoryViewProps } from './InventoryView.types';
import { useInventoryView } from './useInventoryView';
import { InventoryList } from '../inventory-list';
import { BatchExpiryTracker } from '../batch-expiry-tracker';
import { ProcedureRecipeConfig } from '../procedure-recipe-config';

export const InventoryView: React.FC<InventoryViewProps> = ({
  initialTab = 'supplies',
  canWrite: explicitCanWrite,
}) => {
  const { activeTab, setActiveTab, canWrite } = useInventoryView(
    initialTab,
    explicitCanWrite,
  );

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Gestión de Inventario y Almacén Clínico</h1>
          <div className={styles.subtitle}>
            Control de insumos odontológicos, trazabilidad de lotes FEFO y descargo por procedimiento
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'supplies'}
          className={`${styles.tabButton} ${activeTab === 'supplies' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('supplies')}
        >
          <MaterialIcon name="inventory_2" size={20} />
          Insumos y Stock General
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'batches'}
          className={`${styles.tabButton} ${activeTab === 'batches' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('batches')}
        >
          <MaterialIcon name="event_busy" size={20} />
          Caducidades FEFO
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'recipes'}
          className={`${styles.tabButton} ${activeTab === 'recipes' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('recipes')}
        >
          <MaterialIcon name="receipt_long" size={20} />
          Recetas de Procedimiento
        </button>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        {activeTab === 'supplies' && <InventoryList canWrite={canWrite} />}
        {activeTab === 'batches' && <BatchExpiryTracker />}
        {activeTab === 'recipes' && <ProcedureRecipeConfig canWrite={canWrite} />}
      </div>
    </div>
  );
};

