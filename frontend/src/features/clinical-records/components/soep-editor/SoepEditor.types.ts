import { EvolutionNote } from '../../types/evolution-note.types';

export interface SoepEditorProps {
  patientId?: string;
  patientName?: string;
  canWrite?: boolean;
  onNoteCreated?: (note: EvolutionNote) => void;
}

export interface SoepFormData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface AdendaModalState {
  isOpen: boolean;
  targetNoteId: string | null;
  targetNoteDate: string | null;
  clarificationText: string;
  reason: string;
}

