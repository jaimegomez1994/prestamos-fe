import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type {
  Investor,
  InvestorListResponse,
  InvestorFilters,
  CreateInvestorRequest,
  UpdateInvestorRequest,
} from '../types/investor';

const investorApi = {
  getAll: (filters: InvestorFilters): Promise<InvestorListResponse> => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
    const query = params.toString();
    return apiClient.get(`/investors${query ? `?${query}` : ''}`);
  },

  getById: (id: string): Promise<Investor> => apiClient.get(`/investors/${id}`),

  create: (data: CreateInvestorRequest): Promise<Investor> =>
    apiClient.post('/investors', data),

  update: (id: string, data: UpdateInvestorRequest): Promise<Investor> =>
    apiClient.put(`/investors/${id}`, data),

  deactivate: (id: string): Promise<Investor> =>
    apiClient.post(`/investors/${id}/deactivate`),

  activate: (id: string): Promise<Investor> =>
    apiClient.post(`/investors/${id}/activate`),
};

export const useInvestors = (filters: InvestorFilters = {}) => {
  return useQuery({
    queryKey: ['investors', filters],
    queryFn: () => investorApi.getAll(filters),
  });
};

export const useInvestor = (id: string) => {
  return useQuery({
    queryKey: ['investor', id],
    queryFn: () => investorApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateInvestor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: investorApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
    },
  });
};

export const useUpdateInvestor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvestorRequest }) =>
      investorApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
    },
  });
};

export const useDeactivateInvestor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: investorApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
    },
  });
};

export const useActivateInvestor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: investorApi.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
    },
  });
};
