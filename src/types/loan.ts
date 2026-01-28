export interface Loan {
  id: string;
  customerId: string;
  customerName: string;
  investorId: string;
  investorName: string;
  originalAmount: number;
  currentBalance: number;
  loanDate: string;
  paymentMethod: string | null;
  notes: string | null;
  isSettled: boolean;
  settledAt: string | null;
  createdAt: string;
  totalPaidInterest: number;
  totalPaidCapital: number;
}

export interface LoanListResponse {
  loans: Loan[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LoanFilters {
  search?: string;
  customerId?: string;
  investorId?: string;
  isSettled?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateLoanRequest {
  customerId: string;
  investorId: string;
  originalAmount: number;
  loanDate: string;
  paymentMethod?: 'TJ' | 'TM' | 'T' | 'EFECTIVO';
  notes?: string;
}

export interface UpdateLoanRequest {
  paymentMethod?: 'TJ' | 'TM' | 'T' | 'EFECTIVO';
  notes?: string;
}

export type PaymentMethod = 'TJ' | 'TM' | 'T' | 'EFECTIVO';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  TJ: 'Transferencia Jaime',
  TM: 'Transferencia Monica',
  T: 'Transferencia',
  EFECTIVO: 'Efectivo',
};
