import { useState, useEffect, useCallback, useMemo } from 'react';
import { ExpiringBatchItem } from '../../types/inventory.types';
import { FilterAlert, ExpirySummary } from './BatchExpiryTracker.types';
import { inventoryApi } from '../../services/inventoryApi';

export const useBatchExpiryTracker = (daysAhead: number = 60) => {
  const [batches, setBatches] = useState<ExpiringBatchItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterAlert>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadExpiringBatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventoryApi.getExpiringBatches(daysAhead);
      setBatches(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Error al cargar lotes próximos a vencer',
      );
    } finally {
      setIsLoading(false);
    }
  }, [daysAhead]);

  useEffect(() => {
    loadExpiringBatches();
  }, [loadExpiringBatches]);

  const summary = useMemo<ExpirySummary>(() => {
    let caducados = 0;
    let urgente15 = 0;
    let alerta30 = 0;
    let preventivo60 = 0;

    batches.forEach((b) => {
      switch (b.alertLevel) {
        case 'CADUCADO':
          caducados++;
          break;
        case 'URGENTE_15_DIAS':
          urgente15++;
          break;
        case 'ALERTA_30_DIAS':
          alerta30++;
          break;
        case 'PREVENTIVO_60_DIAS':
          preventivo60++;
          break;
      }
    });

    return {
      caducados,
      urgente15,
      alerta30,
      preventivo60,
      total: batches.length,
    };
  }, [batches]);

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchesFilter = filter === 'TODOS' || b.alertLevel === filter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        b.supplyName.toLowerCase().includes(term) ||
        b.supplySku.toLowerCase().includes(term) ||
        b.batchNumber.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [batches, filter, searchTerm]);

  return {
    batches: filteredBatches,
    allBatchesCount: batches.length,
    isLoading,
    error,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    summary,
    refresh: loadExpiringBatches,
  };
};
