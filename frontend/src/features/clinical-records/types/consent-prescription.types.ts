export interface InformedConsent {
  id: string;
  clinicalRecordId: string;
  procedureName: string;
  risksDescription: string;
  patientSignature?: string;
  documentHash?: string;
  signerIp?: string;
  otpCode?: string;
  isSigned: boolean;
  signedAt?: string;
  createdAt: string;
}

export interface MedicationItem {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  indications?: string;
}

export interface Prescription {
  id: string;
  clinicalRecordId: string;
  doctorId: string;
  doctor: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: MedicationItem[];
  instructions?: string;
  qrVerificationCode: string;
  createdAt: string;
}

export interface CreateConsentPayload {
  procedureName: string;
  risksDescription: string;
  templateKey?: string;
}

export interface SignConsentPayload {
  signatureData: string;
  otpCode?: string;
  signerIp?: string;
}

export interface CreatePrescriptionPayload {
  items: MedicationItem[];
  instructions?: string;
  bypassAllergyWarning?: boolean;
}

export const CONSENT_TEMPLATES: Record<string, { procedureName: string; risksDescription: string }> = {
  EXODONCIA: {
    procedureName: 'Exodoncia Simple / Quirúrgica',
    risksDescription:
      'El paciente ha sido informado de los riesgos inherentes: dolor postoperatorio, edema, hemorragia, infección, alveolitis seca, fractura radicular o mandibular y parestesia sensitiva transitoria del nervio dentario inferior.',
  },
  ENDODONCIA: {
    procedureName: 'Tratamiento de Conductos Radiculares (Endodoncia)',
    risksDescription:
      'Se informan los riesgos y limitaciones: dolor periapical post-instrumentación, sobreobturación, fractura de instrumental endodóntico intracanal, perforación radicular y necesidad de retratamiento o cirugía apical.',
  },
  IMPLANTE: {
    procedureName: 'Colocación de Implante Dental Osteointegrado',
    risksDescription:
      'Se detallan los riesgos del procedimiento quirúrgico: fracaso de osteointegración, dehiscencia de tejidos blandos, periimplantitis, compromiso de estructuras anatómicas adyacentes (seno maxilar / nervio dentario) y necesidad de injerto óseo.',
  },
  PERIODONCIA: {
    procedureName: 'Raspaje y Alisado Radicular / Cirugía Periodontal',
    risksDescription:
      'Riesgos asociados: sensibilidad dental transitoria al frío y calor, recesión gingival terapéutica, movilidad dental temporal y necesidad de controles periodontales de mantenimiento periódicos.',
  },
};
