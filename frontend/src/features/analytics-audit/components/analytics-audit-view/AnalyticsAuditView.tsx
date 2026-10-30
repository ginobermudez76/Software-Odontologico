import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './AnalyticsAuditView.module.css';
import { AnalyticsAuditViewProps } from './AnalyticsAuditView.types';
import { useAnalyticsAuditView } from './useAnalyticsAuditView';
import { DirectorDashboard } from '../director-dashboard';
import { AuditLogViewer } from '../audit-log-viewer';

export const AnalyticsAuditView: React.FC<AnalyticsAuditViewProps> = ({
  initialTab = 'dashboard',
}) => {
  const { activeTab, setActiveTab } = useAnalyticsAuditView(initialTab);

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Inteligencia de Negocios y Auditoría Forense</h1>
          <div className={styles.subtitle}>
            Tableros de control directivo (BI), análisis de ausentismo y registros inmutables LOPDP
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'dashboard'}
          className={`${styles.tabButton} ${activeTab === 'dashboard' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <MaterialIcon name="analytics" size={20} />
          Tablero Directivo (BI)
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'audit'}
          className={`${styles.tabButton} ${activeTab === 'audit' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <MaterialIcon name="policy" size={20} />
          Auditoría Forense LOPDP (ASVS)
        </button>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        {activeTab === 'dashboard' && <DirectorDashboard />}
        {activeTab === 'audit' && <AuditLogViewer />}
      </div>
    </div>
  );
};

