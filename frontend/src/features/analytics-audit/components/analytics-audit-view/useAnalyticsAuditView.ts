import { useState } from 'react';
import { AnalyticsAuditTab } from './AnalyticsAuditView.types';

export const useAnalyticsAuditView = (initialTab: AnalyticsAuditTab = 'dashboard') => {
  const [activeTab, setActiveTab] = useState<AnalyticsAuditTab>(initialTab);

  return {
    activeTab,
    setActiveTab,
  };
};

