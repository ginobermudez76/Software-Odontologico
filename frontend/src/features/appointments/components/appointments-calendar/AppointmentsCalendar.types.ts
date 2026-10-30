import { CalendarViewMode } from '../../types/appointment.types';

export interface AppointmentsCalendarProps {
  initialDate?: string;
}

export interface CalendarFilterState {
  viewMode: CalendarViewMode;
  currentDate: string; // YYYY-MM-DD
  chairId: string;
  status: string;
}

