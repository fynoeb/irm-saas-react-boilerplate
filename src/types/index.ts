export interface Investor {
  id?: string;
  name: string;
  firm: string;
  stage: 'Leads' | 'Meeting' | 'Due Diligence' | 'Closing';
  status: 'Active' | 'In Talks' | 'Passed';
  type: string;
  amount: string;
  lastContact: string;
  nextFollowUp?: string;
  color?: string;
  ownerId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Metric {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconName: string;
  ownerId?: string;
}

export interface Update {
  id?: string;
  title: string;
  date: string;
  description?: string;
  category: 'Update' | 'Call' | 'Report';
  status: string;
  ownerId?: string;
  createdAt?: any;
}
