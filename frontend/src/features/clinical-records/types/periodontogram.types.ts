export interface ProbingSite {
  probingDepth: number; // PS (mm)
  gingivalMargin: number; // MG (mm)
  clinicalAttachmentLevel?: number; // NIC = PS + MG (mm)
  bleeding?: boolean; // Sangrado al sondaje (BOP)
  suppuration?: boolean; // Supuración activa
  plaque?: boolean; // Placa bacteriana (O'Leary)
}

export interface ToothSites {
  distal: ProbingSite;
  middle: ProbingSite;
  mesial: ProbingSite;
}

export interface PeriodontalTooth {
  toothNumber: number;
  isMissing?: boolean;
  isImplant?: boolean;
  mobility?: number; // 0, 1, 2, 3
  furcation?: number; // 0, 1, 2, 3, 4
  vestibular: ToothSites;
  lingual: ToothSites;
}

export interface PeriodontogramSummary {
  olearyPlaqueIndex: number;
  bleedingOnProbingIndex: number;
  periodontalPocketsCount: number;
  deepPocketsCount: number;
  evaluatedTeethCount: number;
}

export interface PeriodontogramData {
  teeth: Record<string, PeriodontalTooth>;
  notes?: string;
  summary: PeriodontogramSummary;
}

export interface PeriodontogramResponse {
  recordId: string;
  recordNumber: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    birthDate?: string;
  };
  periodontogram: PeriodontogramData;
  updatedAt: string;
}

/**
 * Cuadrantes dentales para el periodontograma:
 * Maxilar Superior:
 *   - Cuadrante 1: 18 a 11 (Derecho)
 *   - Cuadrante 2: 21 a 28 (Izquierdo)
 * Mandíbula Inferior:
 *   - Cuadrante 4: 48 a 41 (Derecho)
 *   - Cuadrante 3: 31 a 38 (Izquierdo)
 */
export const MAXILLARY_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
];

export const MANDIBULAR_TEETH = [
  48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38,
];

export const createDefaultTooth = (num: number): PeriodontalTooth => ({
  toothNumber: num,
  isMissing: false,
  isImplant: false,
  mobility: 0,
  furcation: 0,
  vestibular: {
    distal: { probingDepth: 2, gingivalMargin: 0, clinicalAttachmentLevel: 2, bleeding: false, suppuration: false, plaque: false },
    middle: { probingDepth: 2, gingivalMargin: 0, clinicalAttachmentLevel: 2, bleeding: false, suppuration: false, plaque: false },
    mesial: { probingDepth: 2, gingivalMargin: 0, clinicalAttachmentLevel: 2, bleeding: false, suppuration: false, plaque: false },
  },
  lingual: {
    distal: { probingDepth: 2, gingivalMargin: 0, clinicalAttachmentLevel: 2, bleeding: false, suppuration: false, plaque: false },
    middle: { probingDepth: 2, gingivalMargin: 0, clinicalAttachmentLevel: 2, bleeding: false, suppuration: false, plaque: false },
    mesial: { probingDepth: 2, gingivalMargin: 0, clinicalAttachmentLevel: 2, bleeding: false, suppuration: false, plaque: false },
  },
});

