export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
export type InvoiceType = 'FACTURA' | 'BOLETA' | 'NOTA_CREDITO';
export type CashShiftStatus = 'ABIERTA' | 'CERRADA_CIEGA' | 'AUDITADA';

export interface PaymentSplit {
  paymentMethod: PaymentMethod;
  amount: number;
  voucherReference?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CashShift {
  id: string;
  branchId: string;
  branchName?: string;
  cashierId?: string;
  cashierName?: string;
  openingTime: string;
  closingTime?: string | null;
  openingBalance: number;
  theoreticalBalance?: number | null;
  declaredPhysicalBalance?: number | null;
  discrepancy?: number | null;
  status: CashShiftStatus;
  notes?: string | null;
}

export interface BlindCloseResult {
  shiftId: string;
  branchId: string;
  branchName: string;
  openingTime: string;
  closingTime: string;
  openingBalance: number;
  totalCashCollected: number;
  totalElectronicCollected: number;
  theoreticalCashBalance: number;
  declaredPhysicalBalance: number;
  discrepancy: number;
  discrepancyType: 'CONCILIADO_EXACTO' | 'SOBRANTE' | 'FALTANTE';
  notes?: string | null;
}

export interface Invoice {
  id: string;
  seriesNumber: string;
  invoiceType: InvoiceType;
  subtotal: number;
  tax: number;
  total: number;
  fiscalStatus: string;
  pdfUrl?: string | null;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
  };
  cashier: {
    id: string;
    firstName: string;
    lastName: string;
  };
  paymentDetails: {
    id: string;
    paymentMethod: PaymentMethod;
    amount: number;
    voucherReference?: string | null;
  }[];
}

export interface CreateInvoicePayload {
  patientId: string;
  appointmentId?: string;
  invoiceType: InvoiceType;
  items: InvoiceItem[];
  paymentDetails: PaymentSplit[];
}
