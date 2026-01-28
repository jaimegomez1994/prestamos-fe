export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  activeLoansCount?: number;
  totalOwed?: number;
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CustomerFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  notes?: string;
}
