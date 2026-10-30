import { ToothCondition } from '../../types/odontogram.types';

export interface OdontogramPaletteProps {
  selectedCondition: ToothCondition;
  onSelectCondition: (condition: ToothCondition) => void;
  applyMode: 'SURFACE' | 'TOOTH';
  onToggleApplyMode: (mode: 'SURFACE' | 'TOOTH') => void;
}
