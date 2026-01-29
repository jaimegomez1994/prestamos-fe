import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type {
  Loan,
  LoanListResponse,
  LoanFilters,
  CreateLoanRequest,
  UpdateLoanRequest,
} from '../types/loan';

const loanApi = {
  getAll: (filters: LoanFilters = {}): Promise<LoanListResponse> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.customerId) params.append('customerId', filters.customerId);
    if (filters.investorId) params.append('investorId', filters.investorId);
    if (filters.isSettled !== undefined) params.append('isSettled', String(filters.isSettled));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.pageSize) params.append('pageSize', String(filters.pageSize));

    const query = params.toString();
    return apiClient.get(`/loans${query ? `?${query}` : ''}`);
  },

  getById: (id: string): Promise<Loan> =>
    apiClient.get(`/loans/${id}`),

  create: (data: CreateLoanRequest): Promise<Loan> =>
    apiClient.post('/loans', data),

  update: (id: string, data: UpdateLoanRequest): Promise<Loan> =>
    apiClient.put(`/loans/${id}`, data),

  reopen: (id: string): Promise<Loan> =>
    apiClient.post(`/loans/${id}/reopen`),
};

export const useLoans = (filters: LoanFilters = {}) => {
  return useQuery({
    queryKey: ['loans', filters],
    queryFn: () => loanApi.getAll(filters),
  });
};

export const useLoan = (id: string) => {
  return useQuery({
    queryKey: ['loan', id],
    queryFn: () => loanApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loanApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLoanRequest }) =>
      loanApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan', id] });
    },
  });
};

export const useReopenLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loanApi.reopen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
