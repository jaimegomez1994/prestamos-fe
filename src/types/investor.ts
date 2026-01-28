export interface Investor {
  id: string;
  name: string;
  profitPercentage: number;
  isActive: boolean;
  createdAt: string;
  activeLoansCount?: number;
  totalInvested?: number;
}

export interface InvestorListResponse {
  investors: Investor[];
  total: number;
  page: number;
  pageSize: number;
}

export interface InvestorFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateInvestorRequest {
  name: string;
  profitPercentage?: number;
}

export interface UpdateInvestorRequest {
  name?: string;
  profitPercentage?: number;
}
