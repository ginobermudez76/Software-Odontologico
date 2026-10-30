export interface EmergencyData {
  contactName: string;
  phone: string;
  relationship: string;
}

export interface LegalTutorData {
  tutorName: string;
  documentNumber: string;
  phone: string;
  relationship: string;
}

export interface InsuranceData {
  companyName?: string;
  policyNumber?: string;
  coveragePercentage?: number;
}

export interface PatientListItem {
  id: string;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string;
  age: number;
  gender: string;
  email?: string;
  phone?: string;
  recordNumber?: string;
  visibleAlerts: string[];
  createdAt: string;
}

export interface PatientDetail extends PatientListItem {
  branchId: string;
  branchName: string;
  address?: string;
  emergencyData?: EmergencyData;
  legalTutorData?: LegalTutorData;
  insuranceData?: InsuranceData;
  clinicalRecord: {
    recordNumber: string;
    visibleAlerts: string[];
    pathologies: string;
    allergies: string;
  };
  updatedAt: string;
}

export interface PatientFormData {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyData?: EmergencyData;
  legalTutorData?: LegalTutorData;
  insuranceData?: InsuranceData;
  pathologies?: string;
  allergies?: string;
  criticalAlerts: string[];
}

