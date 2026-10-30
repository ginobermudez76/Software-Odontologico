import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './TreatmentPlansCommissionsView.module.css';
import { TreatmentPlansCommissionsViewProps } from './TreatmentPlansCommissionsView.types';
import { useTreatmentPlansCommissionsView } from './useTreatmentPlansCommissionsView';
import { TreatmentPlanBuilder } from '../treatment-plan-builder';
import { DoctorSettlementManager } from '../doctor-settlement-manager';

export const TreatmentPlansCommissionsView: React.FC<TreatmentPlansCommissionsViewProps> = ({
  initialTab = 'plans',
  canWrite: explicitCanWrite,
}) => {
  const { activeTab, setActiveTab, canWrite } = useTreatmentPlansCommissionsView(
    initialTab,
    explicitCanWrite,
  );

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Presupuestos Clínicos y Liquidación de Honorarios</h1>
          <div className={styles.subtitle}>
            Planes de tratamiento por fases (Regla RN-04) y cálculo de honorarios con deducción de laboratorio (Regla RN-07)
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'plans'}
          className={`${styles.tabButton} ${activeTab === 'plans' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          <MaterialIcon name="description" size={20} />
          Presupuestos Clínicos (RN-04)
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'settlements'}
          className={`${styles.tabButton} ${activeTab === 'settlements' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('settlements')}
        >
          <MaterialIcon name="payments" size={20} />
          Liquidación de Honorarios (RN-07)
        </button>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        {activeTab === 'plans' && <TreatmentPlanBuilder canWrite={canWrite} />}
        {activeTab === 'settlements' && <DoctorSettlementManager canWrite={canWrite} />}
      </div>
    </div>
  );
};
