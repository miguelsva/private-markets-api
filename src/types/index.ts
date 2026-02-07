export type FundStatus = 'Fundraising' | 'Investing' | 'Closed';
export type InvestorType = 'Individual' | 'Institution' | 'Family Office';

export interface Fund {
  id: string;
  name: string;
  vintage_year: number;
  target_size_usd: number;
  status: FundStatus;
  created_at: string;
}

export interface CreateFundInput {
  name: string;
  vintage_year: number;
  target_size_usd: number;
  status: FundStatus;
}

export interface UpdateFundInput {
  id: string;
  name: string;
  vintage_year: number;
  target_size_usd: number;
  status: FundStatus;
}

export interface Investor {
  id: string;
  name: string;
  investor_type: InvestorType;
  email: string;
  created_at: string;
}

export interface CreateInvestorInput {
  name: string;
  investor_type: InvestorType;
  email: string;
}

export interface Investment {
  id: string;
  investor_id: string;
  fund_id: string;
  amount_usd: number;
  investment_date: string;
}

export interface CreateInvestmentInput {
  investor_id: string;
  amount_usd: number;
  investment_date: string;
}

export interface ApiError {
  message: string;
  errors?: any[];
}
