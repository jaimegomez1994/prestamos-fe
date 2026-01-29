import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type {
  Payment,
  PaymentListResponse,
  PaymentFilters,
  CreatePaymentRequest,
  UpdatePaymentRequest,
} from '../types/payment';

const paymentApi = {
  getAll: (filters: PaymentFilters = {}): Promise<PaymentListResponse> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.loanId) params.append('loanId', filters.loanId);
    if (filters.customerId) params.append('customerId', filters.customerId);
    if (filters.investorId) params.append('investorId', filters.investorId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const query = params.toString();
    return apiClient.get(`/payments${query ? `?${query}` : ''}`);
  },

  getById: (id: string): Promise<Payment> =>
    apiClient.get(`/payments/${id}`),

  getByLoanId: (loanId: string): Promise<{ payments: Payment[] }> =>
    apiClient.get(`/payments/loan/${loanId}`),

  create: (data: CreatePaymentRequest): Promise<Payment[]> =>
    apiClient.post('/payments', data),

  update: (id: string, data: UpdatePaymentRequest): Promise<Payment> =>
    apiClient.put(`/payments/${id}`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/payments/${id}`),
};

export function usePayments(filters: PaymentFilters = {}) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentApi.getAll(filters),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentApi.getById(id),
    enabled: !!id,
  });
}

export function useLoanPayments(loanId: string) {
  return useQuery({
    queryKey: ['payments', 'loan', loanId],
    queryFn: () => paymentApi.getByLoanId(loanId),
    enabled: !!loanId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentRequest }) =>
      paymentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}
