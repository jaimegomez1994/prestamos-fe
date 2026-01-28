import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type {
  Customer,
  CustomerListResponse,
  CustomerFilters,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from '../types/customer';

const customerApi = {
  getAll: (filters: CustomerFilters = {}): Promise<CustomerListResponse> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.pageSize) params.append('pageSize', String(filters.pageSize));

    const query = params.toString();
    return apiClient.get(`/customers${query ? `?${query}` : ''}`);
  },

  getById: (id: string): Promise<Customer> =>
    apiClient.get(`/customers/${id}`),

  create: (data: CreateCustomerRequest): Promise<Customer> =>
    apiClient.post('/customers', data),

  update: (id: string, data: UpdateCustomerRequest): Promise<Customer> =>
    apiClient.put(`/customers/${id}`, data),

  deactivate: (id: string): Promise<Customer> =>
    apiClient.post(`/customers/${id}/deactivate`),

  activate: (id: string): Promise<Customer> =>
    apiClient.post(`/customers/${id}/activate`),
};

export const useCustomers = (filters: CustomerFilters = {}) => {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customerApi.getAll(filters),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      customerApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
  });
};

export const useDeactivateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useActivateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
