import { useState, useMemo } from 'react';
import { ActiveModuleTab } from './TreatmentPlansCommissionsView.types';
import { useAuthStore } from '../../../../stores/authStore';

export const useTreatmentPlansCommissionsView = (
  initialTab: ActiveModuleTab = 'plans',
  explicitCanWrite?: boolean,
) => {
  const [activeTab, setActiveTab] = useState<ActiveModuleTab>(initialTab);
  const navigationTree = useAuthStore((state) => state.navigationTree);

  const canWrite = useMemo(() => {
    if (typeof explicitCanWrite === 'boolean') {
      return explicitCanWrite;
    }
    const option = navigationTree.find(
      (opt) =>
        opt.frontendRoute === '/treatment-plans' ||
        opt.frontendRoute === '/commissions' ||
        opt.optionCode === 'PRESUPUESTOS' ||
        opt.optionCode === 'COMISIONES',
    );
    if (option) {
      return option.escritura;
    }
    return true;
  }, [explicitCanWrite, navigationTree]);

  return {
    activeTab,
    setActiveTab,
    canWrite,
  };
};
