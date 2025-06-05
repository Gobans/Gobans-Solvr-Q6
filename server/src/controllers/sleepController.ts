import { FastifyRequest, FastifyReply } from 'fastify';
import { SleepService } from '../services/sleepService';
import type { NewSleepRecord, UpdateSleepRecord } from '../db/schema';

export class SleepController {
  private sleepService: SleepService;

  constructor() {
    this.sleepService = new SleepService();
  }

  async createSleepRecord(
    request: FastifyRequest<{ Body: Omit<NewSleepRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'> }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ message: '인증이 필요합니다.' });
      }

      const data = request.body;
      const record = await this.sleepService.createSleepRecord(userId, data);
      return reply.status(201).send(record);
    } catch (error) {
      return reply.status(500).send({ message: '수면 기록 생성에 실패했습니다.' });
    }
  }

  async getSleepRecords(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ message: '인증이 필요합니다.' });
      }

      const records = await this.sleepService.getSleepRecords(userId);
      return reply.send(records);
    } catch (error) {
      return reply.status(500).send({ message: '수면 기록 조회에 실패했습니다.' });
    }
  }

  async getSleepRecordById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ message: '인증이 필요합니다.' });
      }

      const id = request.params.id;
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
      Params: { id: string };
      Body: UpdateSleepRecord;
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ message: '인증이 필요합니다.' });
      }

      const id = request.params.id;
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
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ message: '인증이 필요합니다.' });
      }

      const id = request.params.id;
      const success = await this.sleepService.deleteSleepRecord(userId, id);
      
      if (!success) {
        return reply.status(404).send({ message: '수면 기록을 찾을 수 없습니다.' });
      }

      return reply.status(204).send();
    } catch (error) {
      return reply.status(500).send({ message: '수면 기록 삭제에 실패했습니다.' });
    }
  }
} 