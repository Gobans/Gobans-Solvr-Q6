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