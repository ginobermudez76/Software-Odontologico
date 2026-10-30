import { OdontogramNotation, ToothFinding, ToothSurface } from '../../types/odontogram.types';

export interface OdontogramToothProps {
  fdiNumber: number;
  universalLabel: string;
  activeNotation: OdontogramNotation;
  finding?: ToothFinding;
  isUpperArch: boolean;
  isSelected?: boolean;
  onSelectTooth?: (fdiNumber: number) => void;
  onSurfaceClick?: (fdiNumber: number, surface: ToothSurface) => void;
}
