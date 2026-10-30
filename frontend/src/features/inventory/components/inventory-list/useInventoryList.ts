import { useState, useEffect, useCallback } from 'react';
import {
  ClinicalSupply,
  CreateSupplyPayload,
  AddBatchPayload,
} from '../../types/inventory.types';
import { NewSupplyModalState, AddBatchModalState } from './InventoryList.types';
import { inventoryApi } from '../../services/inventoryApi';

export const useInventoryList = (
  onSupplyCreated?: (supply: ClinicalSupply) => void,
) => {
  const [supplies, setSupplies] = useState<ClinicalSupply[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [newModal, setNewModal] = useState<NewSupplyModalState>({
    isOpen: false,
    sku: '',
    name: '',
    brand: '',
    unit: 'Cartucho',
    minStock: 10,
  });

  const [batchModal, setBatchModal] = useState<AddBatchModalState>({
    isOpen: false,
    supplyId: null,
    supplyName: null,
    batchNumber: '',
    expirationDate: '',
    quantity: 50,
    unitCost: 1.0,
  });

  const loadSupplies = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await inventoryApi.getSupplies(searchTerm);
      setSupplies(data);
    } catch (err: any) {
      console.warn('Error al cargar insumos de inventario:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadSupplies();
  }, [loadSupplies]);

  const openNewSupplyModal = () => {
    setNewModal({
      isOpen: true,
      sku: '',
      name: '',
      brand: '',
      unit: 'Cartucho',
      minStock: 10,
    });
  };

  const closeNewSupplyModal = () => {
    setNewModal((prev) => ({ ...prev, isOpen: false }));
  };

  const submitNewSupply = async () => {
    if (!newModal.sku.trim() || !newModal.name.trim() || !newModal.unit.trim()) {
      setFeedback({
        type: 'error',
        message: 'El código SKU, nombre y unidad de medida son obligatorios.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      const payload: CreateSupplyPayload = {
        sku: newModal.sku.trim().toUpperCase(),
        name: newModal.name.trim(),
        brand: newModal.brand.trim() || undefined,
        unit: newModal.unit.trim(),
        minStock: Number(newModal.minStock) || 10,
      };

      const created = await inventoryApi.createSupply(payload);
      setFeedback({
        type: 'success',
        message: `Insumo clínico '${created.name}' registrado exitosamente con SKU: ${created.sku}`,
      });
      closeNewSupplyModal();
      if (onSupplyCreated) {
        onSupplyCreated(created);
      }
      await loadSupplies();
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Error al crear el insumo';
      setFeedback({ type: 'error', message: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddBatchModal = (supply: ClinicalSupply) => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const defaultDate = nextYear.toISOString().split('T')[0];

    setBatchModal({
      isOpen: true,
      supplyId: supply.id,
      supplyName: supply.name,
      batchNumber: '',
      expirationDate: defaultDate,
      quantity: 50,
      unitCost: 1.0,
    });
  };

  const closeAddBatchModal = () => {
    setBatchModal((prev) => ({ ...prev, isOpen: false, supplyId: null }));
  };

  const submitAddBatch = async () => {
    if (!batchModal.supplyId) return;
    if (!batchModal.batchNumber.trim() || !batchModal.expirationDate) {
      setFeedback({
        type: 'error',
        message: 'El número de lote y la fecha de caducidad son obligatorios.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      const payload: AddBatchPayload = {
        batchNumber: batchModal.batchNumber.trim().toUpperCase(),
        expirationDate: new Date(batchModal.expirationDate).toISOString(),
        quantity: Number(batchModal.quantity) || 1,
        unitCost: Number(batchModal.unitCost) || 0,
      };

      const res = await inventoryApi.addBatch(batchModal.supplyId, payload);
      setFeedback({
        type: 'success',
        message: `Lote '${res.batch.batchNumber}' ingresado. Nuevo stock total: ${res.newSupplyStock}`,
      });
      closeAddBatchModal();
      await loadSupplies();
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Error al ingresar el lote';
      setFeedback({ type: 'error', message: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    supplies,
    searchTerm,
    setSearchTerm,
    isLoading,
    isSubmitting,
    feedback,
    newModal,
    setNewModal,
    batchModal,
    setBatchModal,
    openNewSupplyModal,
    closeNewSupplyModal,
    submitNewSupply,
    openAddBatchModal,
    closeAddBatchModal,
    submitAddBatch,
    reload: loadSupplies,
  };
};

