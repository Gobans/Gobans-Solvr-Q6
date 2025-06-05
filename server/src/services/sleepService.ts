import { SleepRecordDao } from '../db/dao/sleepRecordDao';
import type { NewSleepRecord, UpdateSleepRecord } from '../db/schema';
import { SleepInsights, SleepDiagnosis } from '../types/sleep';
import { AIDiagnosisService } from './aiDiagnosisService';

export class SleepService {
  private sleepRecordDao: SleepRecordDao;
  private aiDiagnosisService: AIDiagnosisService;

  constructor() {
    this.sleepRecordDao = new SleepRecordDao();
    this.aiDiagnosisService = new AIDiagnosisService();
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

  async getSleepInsights(userId: string) {
    const records = await this.sleepRecordDao.findAllByUserId(userId);
    
    if (records.length === 0) {
      return {
        totalRecords: 0,
        averageSleepHours: 0,
        averageBedtime: null,
        averageWakeTime: null,
        weeklyAverages: [],
        qualityDistribution: []
      };
    }

    // 평균 수면 시간 계산
    const averageSleepHours = records.reduce((sum, record) => sum + record.totalSleepHours, 0) / records.length;

    // 평균 취침시간과 기상시간 계산
    const bedtimes = records.map(record => this.getTimeInMinutes(new Date(record.sleepStartTime)));
    const waketimes = records.map(record => this.getTimeInMinutes(new Date(record.sleepEndTime)));
    
    const averageBedtime = this.formatMinutesToTime(bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length);
    const averageWakeTime = this.formatMinutesToTime(waketimes.reduce((sum, time) => sum + time, 0) / waketimes.length);

    // 요일별 평균 수면시간 계산
    const weeklyData: Record<string, { total: number; count: number }> = {};
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    
    records.forEach(record => {
      const dayOfWeek = new Date(record.date).getDay();
      const dayName = dayNames[dayOfWeek];
      
      if (!weeklyData[dayName]) {
        weeklyData[dayName] = { total: 0, count: 0 };
      }
      weeklyData[dayName].total += record.totalSleepHours;
      weeklyData[dayName].count += 1;
    });

    const weeklyAverages = dayNames.map(dayName => ({
      day: dayName,
      averageHours: weeklyData[dayName] ? weeklyData[dayName].total / weeklyData[dayName].count : 0,
      recordCount: weeklyData[dayName] ? weeklyData[dayName].count : 0
    }));

    // 수면 품질 분포 계산
    const qualityCount: Record<number, number> = {};
    records.forEach(record => {
      qualityCount[record.quality] = (qualityCount[record.quality] || 0) + 1;
    });

    const qualityDistribution = Object.entries(qualityCount).map(([quality, count]) => ({
      quality: parseInt(quality),
      count: count as number,
      percentage: Math.round((count as number / records.length) * 100)
    })).sort((a, b) => a.quality - b.quality);

    return {
      totalRecords: records.length,
      averageSleepHours: Math.round(averageSleepHours * 10) / 10, // 소수점 1자리
      averageBedtime,
      averageWakeTime,
      weeklyAverages,
      qualityDistribution
    };
  }

  // 시간을 분 단위로 변환 (00:00부터의 분)
  private getTimeInMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  // 분을 HH:MM 형식으로 변환
  private formatMinutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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

  async getSleepDiagnosis(userId: string): Promise<SleepDiagnosis> {
    const insights = await this.getSleepInsights(userId);
    return this.aiDiagnosisService.diagnoseSleep(insights);
  }
} 