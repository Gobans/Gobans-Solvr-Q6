import { SleepRecord, NewSleepRecord } from '../types/sleep';

const API_BASE_URL = 'http://localhost:8000/api';

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

export const sleepApi = {
  // 수면 기록 생성
  createSleepRecord: async (data: NewSleepRecord, userId: string): Promise<SleepRecord> => {
    const response = await fetch(`${API_BASE_URL}/sleep/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('수면 기록 생성에 실패했습니다.');
    return response.json();
  },

  // 수면 기록 목록 조회
  getSleepRecords: async (userId: string): Promise<SleepRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/sleep/${userId}`);
    if (!response.ok) throw new Error('수면 기록 조회에 실패했습니다.');
    return response.json();
  },

  // 수면 인사이트 조회
  getSleepInsights: async (userId: string): Promise<SleepInsights> => {
    const response = await fetch(`${API_BASE_URL}/sleep/${userId}/insights`);
    if (!response.ok) throw new Error('수면 인사이트 조회에 실패했습니다.');
    return response.json();
  },

  // 수면 기록 수정
  updateSleepRecord: async (id: string, data: Partial<NewSleepRecord>, userId: string): Promise<SleepRecord> => {
    const response = await fetch(`${API_BASE_URL}/sleep/${userId}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('수면 기록 수정에 실패했습니다.');
    return response.json();
  },

  // 수면 기록 삭제
  deleteSleepRecord: async (id: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/sleep/${userId}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('수면 기록 삭제에 실패했습니다.');
  },
}; 