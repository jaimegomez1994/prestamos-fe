import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { InvestorListResponse } from '../types/investor';

const investorApi = {
  getAll: (activeOnly = true): Promise<InvestorListResponse> =>
    apiClient.get(`/investors${activeOnly ? '' : '?activeOnly=false'}`),
};

export const useInvestors = (activeOnly = true) => {
  return useQuery({
    queryKey: ['investors', { activeOnly }],
    queryFn: () => investorApi.getAll(activeOnly),
  });
};
