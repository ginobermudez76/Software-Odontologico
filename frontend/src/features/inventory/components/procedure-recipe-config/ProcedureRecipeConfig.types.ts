import { ClinicalSupply, RecipeSupplyItem } from '../../types/inventory.types';

export interface ProcedureOption {
  id: string;
  code: string;
  name: string;
  category: string;
}

export interface RecipeItemState extends RecipeSupplyItem {
  supplyName?: string;
  supplySku?: string;
  unit?: string;
}

export interface ProcedureRecipeConfigProps {
  canWrite?: boolean;
  procedures?: ProcedureOption[];
  onRecipeSaved?: (procedureId: string, suppliesCount: number) => void;
}
