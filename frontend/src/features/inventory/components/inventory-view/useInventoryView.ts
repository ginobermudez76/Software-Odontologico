import { useState, useMemo } from 'react';
import { InventoryTab } from './InventoryView.types';
import { useAuthStore } from '../../../../stores/authStore';

export const useInventoryView = (initialTab: InventoryTab = 'supplies', explicitCanWrite?: boolean) => {
  const [activeTab, setActiveTab] = useState<InventoryTab>(initialTab);
  const navigationTree = useAuthStore((state) => state.navigationTree);

  const canWrite = useMemo(() => {
    if (typeof explicitCanWrite === 'boolean') {
      return explicitCanWrite;
    }
    const inventoryOption = navigationTree.find(
      (opt) => opt.frontendRoute === '/inventory' || opt.optionCode === 'INVENTARIO',
    );
    if (inventoryOption) {
      return inventoryOption.escritura;
    }
    // Default to true for clinical operators/admins unless restricted
    return true;
  }, [explicitCanWrite, navigationTree]);

  return {
    activeTab,
    setActiveTab,
    canWrite,
  };
};
