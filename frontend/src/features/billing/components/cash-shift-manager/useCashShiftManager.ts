import { useState, useEffect, useCallback } from 'react';
import { useCurrentOptionPermissions } from '../../../../hooks/useCurrentOptionPermissions';
import { useAuthStore } from '../../../../stores/authStore';
import { billingApi } from '../../services/billingApi';
import { CashShift } from '../../types/billing.types';

export const useCashShiftManager = () => {
  const { canWrite } = useCurrentOptionPermissions();
  const user = useAuthStore((state) => state.user);
  const branchId = user?.branchId || '00000000-0000-0000-0000-000000000001';

  const [currentShift, setCurrentShift] = useState<CashShift | null>(null);
  const [shiftHistory, setShiftHistory] = useState<CashShift[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpeningShift, setIsOpeningShift] = useState<boolean>(false);
  const [openingBalance, setOpeningBalance] = useState<string>('100.00');
  const [openingNotes, setOpeningNotes] = useState<string>('');
  const [isBlindModalOpen, setIsBlindModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [active, history] = await Promise.all([
        billingApi.getCurrentShift(branchId),
        billingApi.getShiftHistory(branchId),
      ]);
      setCurrentShift(active);
      setShiftHistory(history);
    } catch {
      // Fallback
      setCurrentShift(null);
      setShiftHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const balanceNum = parseFloat(openingBalance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      setErrorMessage('Ingrese un monto de apertura válido.');
      return;
    }

    setIsOpeningShift(true);
    try {
      const newShift = await billingApi.openShift(branchId, balanceNum, openingNotes);
      setCurrentShift(newShift);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || 'Error al abrir caja');
    } finally {
      setIsOpeningShift(false);
    }
  };

  const handleBlindCloseSuccess = () => {
    setCurrentShift(null);
    loadData();
  };

  return {
    branchId,
    currentShift,
    shiftHistory,
    isLoading,
    isOpeningShift,
    openingBalance,
    setOpeningBalance,
    openingNotes,
    setOpeningNotes,
    isBlindModalOpen,
    setIsBlindModalOpen,
    errorMessage,
    canWrite,
    handleOpenShift,
    handleBlindCloseSuccess,
  };
};

