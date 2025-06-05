import { FastifyInstance } from 'fastify';
import { SleepController } from '../controllers/sleepController';

export default async function sleepRoutes(fastify: FastifyInstance) {
  const sleepController = new SleepController();

  // 수면 기록 생성
  fastify.post('/', sleepController.createSleepRecord);

  // 수면 기록 목록 조회
  fastify.get('/', sleepController.getSleepRecords);

  // 특정 수면 기록 조회
  fastify.get('/:id', sleepController.getSleepRecordById);

  // 수면 기록 수정
  fastify.put('/:id', sleepController.updateSleepRecord);

  // 수면 기록 삭제
  fastify.delete('/:id', sleepController.deleteSleepRecord);
} 