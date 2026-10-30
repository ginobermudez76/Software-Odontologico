import { InformedConsent } from '../../types/consent-prescription.types';

export interface ConsentManagerProps {
  patientId?: string;
  patientName?: string;
  canWrite?: boolean;
  onConsentSigned?: (consent: InformedConsent) => void;
}

export interface NewConsentModalState {
  isOpen: boolean;
  procedureName: string;
  risksDescription: string;
  templateKey?: string;
}

export interface SigningModalState {
  isOpen: boolean;
  consent: InformedConsent | null;
  signatureData: string | null;
  otpCode?: string;
}

