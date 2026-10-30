export interface KpiPeriod {
  start: string;
  end: string;
}

export interface AppointmentKpis {
  total: number;
  attended: number;
  noShow: number;
  cancelled: number;
  noShowRate: number;
  chairOccupancyRate: number;
}

export interface FinancialKpis {
  totalRevenue: number;
  invoiceCount: number;
  averageTicket: number;
  totalLabCostsDeducted: number;
  totalCommissionsPaid: number;
  grossMargin: number;
}

export interface TopProcedureKpi {
  code: string;
  name: string;
  count: number;
  totalBilled: number;
}

export interface DirectorKpisResponse {
  period: KpiPeriod;
  appointments: AppointmentKpis;
  financials: FinancialKpis;
  topProcedures: TopProcedureKpi[];
}

export interface ForensicAuditLog {
  id: string;
  userId?: string | null;
  userRole?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  eventTimestamp: string;
  metadata?: any;
  integrityHash?: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface AuditLogsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  logs: ForensicAuditLog[];
}
