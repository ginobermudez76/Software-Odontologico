export type ActiveModuleTab = 'plans' | 'settlements';

export interface TreatmentPlansCommissionsViewProps {
  initialTab?: ActiveModuleTab;
  canWrite?: boolean;
}
