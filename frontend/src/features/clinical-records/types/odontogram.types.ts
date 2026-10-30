export type ToothSurface = 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'occlusal';

export type ToothCondition =
  | 'HEALTHY'
  | 'CARIES'
  | 'RESTORATION'
  | 'CROWN'
  | 'ENDODONTICS'
  | 'IMPLANT'
  | 'EXTRACTION_PROJECTED'
  | 'EXTRACTED'
  | 'SEALANT'
  | 'FRACTURE';

export type OdontogramNotation = 'FDI' | 'UNIVERSAL';
export type DentitionType = 'PERMANENT' | 'TEMPORARY';
export type OdontogramMode = 'INITIAL' | 'EVOLUTIONARY';

export interface ToothFinding {
  toothId: string; // Notación FDI base
  state: ToothCondition;
  surfaces?: Partial<Record<ToothSurface, ToothCondition>>;
  notes?: string;
  projectedTreatment?: string;
}

export type OdontogramState = Record<string, ToothFinding>;

export interface OdontogramResponse {
  recordId: string;
  recordNumber: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    birthDate: string;
  };
  visibleAlerts?: string[];
  initialOdontogram: OdontogramState;
  evolutionaryOdontogram: OdontogramState;
  updatedAt: string;
}

// Mapeos de Notación FDI a Notación Universal Americana
export const FDI_TO_UNIVERSAL_PERMANENT: Record<number, string> = {
  18: '1', 17: '2', 16: '3', 15: '4', 14: '5', 13: '6', 12: '7', 11: '8',
  21: '9', 22: '10', 23: '11', 24: '12', 25: '13', 26: '14', 27: '15', 28: '16',
  38: '17', 37: '18', 36: '19', 35: '20', 34: '21', 33: '22', 32: '23', 31: '24',
  48: '32', 47: '31', 46: '30', 45: '29', 44: '28', 43: '27', 42: '26', 41: '25',
};

export const FDI_TO_UNIVERSAL_TEMPORARY: Record<number, string> = {
  55: 'A', 54: 'B', 53: 'C', 52: 'D', 51: 'E',
  61: 'F', 62: 'G', 63: 'H', 64: 'I', 65: 'J',
  75: 'K', 74: 'L', 73: 'M', 72: 'N', 71: 'O',
  85: 'T', 84: 'S', 83: 'R', 82: 'Q', 81: 'P',
};

// Cuadrantes de Dentición Permanente (Adulto - 32 piezas)
export const QUADRANT_1_PERMANENT = [18, 17, 16, 15, 14, 13, 12, 11]; // Superior Derecho
export const QUADRANT_2_PERMANENT = [21, 22, 23, 24, 25, 26, 27, 28]; // Superior Izquierdo
export const QUADRANT_4_PERMANENT = [48, 47, 46, 45, 44, 43, 42, 41]; // Inferior Derecho
export const QUADRANT_3_PERMANENT = [31, 32, 33, 34, 35, 36, 37, 38]; // Inferior Izquierdo

// Cuadrantes de Dentición Decidua / Temporal (Infantil - 20 piezas)
export const QUADRANT_5_TEMPORARY = [55, 54, 53, 52, 51]; // Superior Derecho Infantil
export const QUADRANT_6_TEMPORARY = [61, 62, 63, 64, 65]; // Superior Izquierdo Infantil
export const QUADRANT_8_TEMPORARY = [85, 84, 83, 82, 81]; // Inferior Derecho Infantil
export const QUADRANT_7_TEMPORARY = [71, 72, 73, 74, 75]; // Inferior Izquierdo Infantil
