import { FastifyRequest, FastifyReply } from 'fastify';
import { SleepService } from '../services/sleepService';
import type { NewSleepRecord, UpdateSleepRecord } from '../db/schema';

export class SleepController {
  private sleepService: SleepService;

  constructor() {
    this.sleepService = new SleepService();
  }

  async createSleepRecord(
    request: FastifyRequest<{ 
      Params: { userId: string }; 
      Body: Omit<NewSleepRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'> 
    }>,
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params;
      const data = request.body;
      console.log('Creating sleep record for user:', userId, 'with data:', data);
      
      const record = await this.sleepService.createSleepRecord(userId, data);
      console.log('Sleep record created successfully:', record);
      
      return reply.status(201).send(record);
    } catch (error) {
      console.error('Error creating sleep record:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return reply.status(500).send({ message: '수면 기록 생성에 실패했습니다.', error: errorMessage });
    }
  }

  async getSleepRecords(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params;
      const records = await this.sleepService.getSleepRecords(userId);
      return reply.send(records);
    } catch (error) {
      return reply.status(500).send({ message: '수면 기록 조회에 실패했습니다.' });
    }
  }

  async getSleepRecordById(
    request: FastifyRequest<{ Params: { userId: string; id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, id } = request.params;
      const record = await this.sleepService.getSleepRecordById(userId, id);
      
      if (!record) {
        return reply.status(404).send({ message: '수면 기록을 찾을 수 없습니다.' });
      }

      return reply.send(record);
    } catch (error) {
      return reply.status(500).send({ message: '수면 기록 조회에 실패했습니다.' });
    }
  }

  async updateSleepRecord(
    request: FastifyRequest<{
      Params: { userId: string; id: string };
      Body: UpdateSleepRecord;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, id } = request.params;
      const data = request.body;
      const updatedRecord = await this.sleepService.updateSleepRecord(userId, id, data);
      
      if (!updatedRecord) {
        return reply.status(404).send({ message: '수면 기록을 찾을 수 없습니다.' });
      }

      return reply.send(updatedRecord);
    } catch (error) {
      return reply.status(500).send({ message: '수면 기록 수정에 실패했습니다.' });
    }
  }

  async deleteSleepRecord(
    request: FastifyRequest<{ Params: { userId: string; id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, id } = request.params;
      const success = await this.sleepService.deleteSleepRecord(userId, id);
      
      if (!success) {
        return reply.status(404).send({ message: '수면 기록을 찾을 수 없습니다.' });
      }

      return reply.status(204).send();
    } catch (error) {
      return reply.status(500).send({ message: '수면 기록 삭제에 실패했습니다.' });
    }
  }

  async getSleepInsights(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params;
      const insights = await this.sleepService.getSleepInsights(userId);
      return reply.send(insights);
    } catch (error) {
      console.error('Error getting sleep insights:', error);
      return reply.status(500).send({ message: '수면 인사이트 조회에 실패했습니다.' });
    }
  }
} 