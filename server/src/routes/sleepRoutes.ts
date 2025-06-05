import { FastifyInstance } from 'fastify';
import { SleepController } from '../controllers/sleepController';

const sleepController = new SleepController();

export default async function sleepRoutes(fastify: FastifyInstance) {
  // 수면 기록 생성
  fastify.post('/:userId', sleepController.createSleepRecord.bind(sleepController));

  // 수면 기록 목록 조회 (사용자별)
  fastify.get('/:userId', sleepController.getSleepRecords.bind(sleepController));

  // 수면 기록 단일 조회
  fastify.get('/:userId/:id', sleepController.getSleepRecordById.bind(sleepController));

  // 수면 기록 수정
  fastify.put('/:userId/:id', sleepController.updateSleepRecord.bind(sleepController));

  // 수면 기록 삭제
  fastify.delete('/:userId/:id', sleepController.deleteSleepRecord.bind(sleepController));
} 