import { useState, useEffect, useCallback } from 'react';
import { ClinicalSupply } from '../../types/inventory.types';
import { ProcedureOption, RecipeItemState } from './ProcedureRecipeConfig.types';
import { inventoryApi } from '../../services/inventoryApi';

export const useProcedureRecipeConfig = (
  procedures?: ProcedureOption[],
  onRecipeSaved?: (procedureId: string, count: number) => void,
) => {
  const [availableSupplies, setAvailableSupplies] = useState<ClinicalSupply[]>([]);
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>(
    procedures && procedures.length > 0 ? procedures[0].id : '',
  );
  const [recipeItems, setRecipeItems] = useState<RecipeItemState[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // New item selector states
  const [selectedSupplyToAdd, setSelectedSupplyToAdd] = useState<string>('');
  const [quantityToAdd, setQuantityToAdd] = useState<number>(1);

  // Load available clinical supplies
  useEffect(() => {
    let isMounted = true;
    inventoryApi.getSupplies().then((supplies) => {
      if (isMounted) {
        setAvailableSupplies(supplies);
        if (supplies.length > 0 && !selectedSupplyToAdd) {
          setSelectedSupplyToAdd(supplies[0].id);
        }
      }
    }).catch(() => {
      // Handled silently
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // When procedure changes, load its configured recipe
  const loadProcedureRecipe = useCallback(async (procedureId: string) => {
    if (!procedureId) {
      setRecipeItems([]);
      return;
    }
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await inventoryApi.getProcedureRecipe(procedureId);
      if (data && Array.isArray(data.items)) {
        setRecipeItems(
          data.items.map((item: any) => ({
            supplyId: item.supplyId,
            supplyName: item.supply?.name || item.supplyName || 'Insumo',
            supplySku: item.supply?.sku || item.supplySku || '',
            unit: item.supply?.unit || item.unit || 'unidad',
            quantity: Number(item.quantity),
          })),
        );
      } else {
        setRecipeItems([]);
      }
    } catch (err: any) {
      setRecipeItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProcedureId) {
      loadProcedureRecipe(selectedProcedureId);
    }
  }, [selectedProcedureId, loadProcedureRecipe]);

  const addSupplyItem = () => {
    if (!selectedSupplyToAdd || quantityToAdd <= 0) return;

    const existingIndex = recipeItems.findIndex(
      (item) => item.supplyId === selectedSupplyToAdd,
    );
    const supply = availableSupplies.find((s) => s.id === selectedSupplyToAdd);

    if (existingIndex >= 0) {
      // Update existing item quantity
      const updated = [...recipeItems];
      updated[existingIndex].quantity = Number(
        (updated[existingIndex].quantity + quantityToAdd).toFixed(2),
      );
      setRecipeItems(updated);
    } else {
      setRecipeItems([
        ...recipeItems,
        {
          supplyId: selectedSupplyToAdd,
          supplyName: supply?.name || 'Insumo',
          supplySku: supply?.sku || '',
          unit: supply?.unit || 'unidad',
          quantity: quantityToAdd,
        },
      ]);
    }
  };

  const removeSupplyItem = (supplyId: string) => {
    setRecipeItems(recipeItems.filter((item) => item.supplyId !== supplyId));
  };

  const updateQuantity = (supplyId: string, quantity: number) => {
    if (quantity <= 0) return;
    setRecipeItems(
      recipeItems.map((item) =>
        item.supplyId === supplyId ? { ...item, quantity } : item,
      ),
    );
  };

  const saveRecipe = async () => {
    if (!selectedProcedureId) {
      setFeedback({
        type: 'error',
        message: 'Debe seleccionar un procedimiento odontológico',
      });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      await inventoryApi.configureProcedureRecipe(selectedProcedureId, {
        supplies: recipeItems.map((i) => ({
          supplyId: i.supplyId,
          quantity: i.quantity,
        })),
      });

      setFeedback({
        type: 'success',
        message: 'Receta clínica y descargo estándar guardados exitosamente',
      });

      if (onRecipeSaved) {
        onRecipeSaved(selectedProcedureId, recipeItems.length);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message:
          err?.response?.data?.detail ||
          err?.message ||
          'Error al guardar la receta de insumos',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    availableSupplies,
    selectedProcedureId,
    setSelectedProcedureId,
    recipeItems,
    isLoading,
    isSaving,
    feedback,
    selectedSupplyToAdd,
    setSelectedSupplyToAdd,
    quantityToAdd,
    setQuantityToAdd,
    addSupplyItem,
    removeSupplyItem,
    updateQuantity,
    saveRecipe,
    reloadRecipe: () => loadProcedureRecipe(selectedProcedureId),
  };
};

