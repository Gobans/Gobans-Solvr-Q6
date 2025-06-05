export type SleepRecord = {
  id: string;
  userId: string;
  date: Date;
  sleepStartTime: Date;
  sleepEndTime: Date;
  totalSleepHours: number;
  quality: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSleepRecordDTO = {
  date: Date;
  sleepStartTime: Date;
  sleepEndTime: Date;
  quality: number;
  notes?: string;
};

export type UpdateSleepRecordDTO = {
  sleepStartTime?: Date;
  sleepEndTime?: Date;
  quality?: number;
  notes?: string;
};

export interface SleepInsights {
  totalRecords: number;
  averageSleepHours: number;
  averageBedtime: string | null;
  averageWakeTime: string | null;
  weeklyAverages: {
    day: string;
    averageHours: number;
    recordCount: number;
  }[];
  qualityDistribution: {
    quality: number;
    count: number;
    percentage: number;
  }[];
}

export interface SleepDiagnosis {
  diagnosis: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  sleepScore: number;
} 