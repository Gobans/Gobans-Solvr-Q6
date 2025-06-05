export interface SleepRecord {
  id: string;
  userId: string;
  date: string;
  sleepStartTime: string;
  sleepEndTime: string;
  totalSleepHours: number;
  quality: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewSleepRecord {
  date: string;
  sleepStartTime: string;
  sleepEndTime: string;
  totalSleepHours: number;
  quality: number;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
} 

export interface SleepInsights {
  totalRecords: number;
  averageSleepHours: number;
  averageBedtime: string | null;
  averageWakeTime: string | null;
  weeklyAverages: Array<{
    day: string;
    averageHours: number;
    recordCount: number;
  }>;
  qualityDistribution: Array<{
    quality: number;
    count: number;
    percentage: number;
  }>;
}

export interface SleepDiagnosis {
  diagnosis: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  sleepScore: number;
}