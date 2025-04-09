// types/index.ts

export type AspirationType = 'design' | 'dev' | 'media';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface ApplicationLog {
  action: ApplicationStatus;
  timestamp: string;
  note?: string;
  admin: string;
}

export interface Application {
  id: string;
  fullName: string;
  email: string;
  aspiration: AspirationType;
  reason: string;
  status: ApplicationStatus;
  logs: ApplicationLog[];
  createdAt: string;
}

export interface Member {
  id: string;
  fullName: string;
  email: string;
  role: string;
  team: AspirationType;
  applicationId: string;
  joinedAt: string;
}

export interface StatisticData {
  design: number;
  dev: number;
  media: number;
}

export interface StatusStatistic {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface TeamStatistic {
  design: number;
  dev: number;
  media: number;
  total: number;
}

export interface Statistics {
  aspirations: StatisticData;
  status: StatusStatistic;
  teams: TeamStatistic;
}
