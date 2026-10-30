export type InventoryTab = 'supplies' | 'batches' | 'recipes';

export interface InventoryViewProps {
  initialTab?: InventoryTab;
  canWrite?: boolean;
}

