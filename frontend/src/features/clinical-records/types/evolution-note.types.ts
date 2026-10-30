export interface NoteDoctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface NoteAdenda {
  id: string;
  doctorId: string;
  doctor: NoteDoctor;
  clarificationText: string;
  subjective: string;
  plan?: string;
  createdAt: string;
}

export interface EvolutionNote {
  id: string;
  clinicalRecordId: string;
  doctorId: string;
  doctor: NoteDoctor;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  isLocked: boolean;
  isEditable: boolean;
  remainingHoursToEdit: number;
  isAdenda: boolean;
  originalNoteId?: string;
  createdAt: string;
  updatedAt: string;
  adendas: NoteAdenda[];
}

export interface CreateEvolutionNotePayload {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  cie10Codes?: string[];
}

export interface UpdateEvolutionNotePayload {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface CreateAdendaPayload {
  clarificationText: string;
  reason?: string;
}

export interface EvolutionNotesResponse {
  recordId: string;
  patientId: string;
  totalNotes: number;
  notes: EvolutionNote[];
}
