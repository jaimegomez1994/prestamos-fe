import type { PaymentMethod } from './loan';

export interface Payment {
  id: string;
  loanId: string;
  customerName: string;
  investorName: string;
  paymentDate: string;
  interestPaid: number;
  capitalPaid: number;
  totalPaid: number;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaymentFilters {
  search?: string;
  loanId?: string;
  customerId?: string;
  investorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CreatePaymentRequest {
  customerId: string;
  paymentDate: string;
  interestPaid: number;
  capitalPaid: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdatePaymentRequest {
  paymentDate?: string;
  interestPaid?: number;
  capitalPaid?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
}
