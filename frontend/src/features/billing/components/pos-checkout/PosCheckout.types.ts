import { Invoice, InvoiceItem, InvoiceType, PaymentSplit } from '../../types/billing.types';

export interface PosCheckoutState {
  patientId: string;
  invoiceType: InvoiceType;
  items: InvoiceItem[];
  payments: PaymentSplit[];
}

export interface PosCheckoutProps {
  initialPatientId?: string;
}

