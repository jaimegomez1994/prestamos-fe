export interface Investor {
  id: string;
  name: string;
  profitPercentage: number;
  isActive: boolean;
}

export interface InvestorListResponse {
  investors: Investor[];
}
