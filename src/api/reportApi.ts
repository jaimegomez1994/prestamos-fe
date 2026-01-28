import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type {
  InvestorReportResponse,
  PaymentSummaryResponse,
  PortfolioSummaryResponse,
  ReportFilters,
} from '../types/report';

const reportApi = {
  getInvestorReport: (filters: ReportFilters): Promise<InvestorReportResponse> => {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.investorId) params.set('investorId', filters.investorId);
    const query = params.toString();
    return apiClient.get(`/reports/investors${query ? `?${query}` : ''}`);
  },

  getPaymentSummary: (filters: ReportFilters): Promise<PaymentSummaryResponse> => {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.investorId) params.set('investorId', filters.investorId);
    if (filters.groupBy) params.set('groupBy', filters.groupBy);
    const query = params.toString();
    return apiClient.get(`/reports/payments${query ? `?${query}` : ''}`);
  },

  getPortfolioSummary: (): Promise<PortfolioSummaryResponse> =>
    apiClient.get('/reports/portfolio'),
};

export const useInvestorReport = (filters: ReportFilters = {}) => {
  return useQuery({
    queryKey: ['reports', 'investors', filters],
    queryFn: () => reportApi.getInvestorReport(filters),
  });
};

export const usePaymentSummary = (filters: ReportFilters = {}) => {
  return useQuery({
    queryKey: ['reports', 'payments', filters],
    queryFn: () => reportApi.getPaymentSummary(filters),
  });
};

export const usePortfolioSummary = () => {
  return useQuery({
    queryKey: ['reports', 'portfolio'],
    queryFn: reportApi.getPortfolioSummary,
  });
};
