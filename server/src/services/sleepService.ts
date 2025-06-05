import { SleepRecordDao } from '../db/dao/sleepRecordDao';
import type { NewSleepRecord, UpdateSleepRecord } from '../db/schema';

export class SleepService {
  private sleepRecordDao: SleepRecordDao;

  constructor() {
    this.sleepRecordDao = new SleepRecordDao();
  }

  async createSleepRecord(userId: string, data: Omit<NewSleepRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const totalSleepHours = this.calculateSleepHours(data.date, data.sleepStartTime, data.sleepEndTime);
    
    // 문자열을 Date 객체로 변환
    const baseDate = typeof data.date === 'string' ? new Date(data.date) : data.date;
    const sleepStartTime = this.parseTimeToDate(baseDate, data.sleepStartTime);
    const sleepEndTime = this.parseTimeToDate(baseDate, data.sleepEndTime);
    
    // 만약 종료 시간이 시작 시간보다 이르다면 (다음날로 넘어간 경우)
    if (sleepEndTime <= sleepStartTime) {
      sleepEndTime.setDate(sleepEndTime.getDate() + 1);
    }
    
    return await this.sleepRecordDao.create({
      userId,
      date: baseDate,
      sleepStartTime,
      sleepEndTime,
      totalSleepHours,
      quality: data.quality,
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

    // 업데이트할 데이터 준비
    const updateData: any = { ...data };
    
    // 날짜나 시간이 변경되는 경우 Date 객체로 변환
    if (data.date) {
      updateData.date = typeof data.date === 'string' ? new Date(data.date) : data.date;
    }
    
    if (data.sleepStartTime || data.sleepEndTime) {
      const baseDate = updateData.date || record.date;
      
      if (data.sleepStartTime) {
        updateData.sleepStartTime = this.parseTimeToDate(baseDate, data.sleepStartTime);
      }
      
      if (data.sleepEndTime) {
        updateData.sleepEndTime = this.parseTimeToDate(baseDate, data.sleepEndTime);
      }
      
      // 수면 시간 재계산
      const startTime = updateData.sleepStartTime || record.sleepStartTime;
      const endTime = updateData.sleepEndTime || record.sleepEndTime;
      updateData.totalSleepHours = this.calculateSleepHours(baseDate, startTime, endTime);
    }

    return await this.sleepRecordDao.update(id, userId, updateData);
  }

  async deleteSleepRecord(userId: string, id: string) {
    return await this.sleepRecordDao.delete(id, userId);
  }

  private calculateSleepHours(date: string | Date, startTime: string | Date, endTime: string | Date): number {
    // 날짜 문자열을 Date 객체로 변환
    const baseDate = typeof date === 'string' ? new Date(date) : date;
    
    // 시간 문자열을 Date 객체로 변환
    const start = this.parseTimeToDate(baseDate, startTime);
    const end = this.parseTimeToDate(baseDate, endTime);
    
    // 만약 종료 시간이 시작 시간보다 이르다면 (다음날로 넘어간 경우)
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60 * 60)); // Convert to hours and round
  }

  private parseTimeToDate(baseDate: Date, time: string | Date): Date {
    if (time instanceof Date) {
      return new Date(time);
    }
    
    // "HH:MM" 형식의 문자열을 Date 객체로 변환
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(baseDate);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }
} 