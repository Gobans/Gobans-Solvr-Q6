import { SleepRecordDao } from '../db/dao/sleepRecordDao';
import type { NewSleepRecord, UpdateSleepRecord } from '../db/schema';

export class SleepService {
  private sleepRecordDao: SleepRecordDao;

  constructor() {
    this.sleepRecordDao = new SleepRecordDao();
  }

  async createSleepRecord(userId: string, data: Omit<NewSleepRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const totalSleepHours = this.calculateSleepHours(data.sleepStartTime, data.sleepEndTime);
    
    return await this.sleepRecordDao.create({
      userId,
      ...data,
      totalSleepHours,
      notes: data.notes || '',
    });
  }

  async getSleepRecords(userId: string) {
    return await this.sleepRecordDao.findAllByUserId(userId);
  }

  async getSleepRecordById(userId: string, id: string) {
    return await this.sleepRecordDao.findByIdAndUserId(id, userId);
  }

  async updateSleepRecord(userId: string, id: string, data: UpdateSleepRecord) {
    const record = await this.getSleepRecordById(userId, id);
    if (!record) return null;

    const totalSleepHours = data.sleepStartTime && data.sleepEndTime
      ? this.calculateSleepHours(data.sleepStartTime, data.sleepEndTime)
      : record.totalSleepHours;

    return await this.sleepRecordDao.update(id, userId, {
      ...data,
      totalSleepHours,
    });
  }

  async deleteSleepRecord(userId: string, id: string) {
    return await this.sleepRecordDao.delete(id, userId);
  }

  private calculateSleepHours(startTime: Date, endTime: Date): number {
    const diffMs = endTime.getTime() - startTime.getTime();
    return Math.round(diffMs / (1000 * 60 * 60)); // Convert to hours and round
  }
} 