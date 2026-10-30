export interface PeriodontogramTableProps {
  patientId?: string;
  patientName?: string;
  canWrite?: boolean;
  onSaved?: () => void;
}

export type PeriodontalArch = 'MAXILLARY' | 'MANDIBULAR';
export type PeriodontalAspect = 'VESTIBULAR' | 'LINGUAL';
