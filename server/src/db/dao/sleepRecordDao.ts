import { getDb } from '../index';
import { sleepRecords } from '../schema';
import { eq, and } from 'drizzle-orm';
import type { NewSleepRecord, UpdateSleepRecord } from '../schema';
import crypto from 'crypto';

export class SleepRecordDao {
  async create(data: Omit<NewSleepRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const db = await getDb();
    const [record] = await db.insert(sleepRecords)
      .values({
        ...data,
        id: crypto.randomUUID(),
      })
      .returning();
    return record;
  }

  async findAllByUserId(userId: string) {
    const db = await getDb();
    return await db.select()
      .from(sleepRecords)
      .where(eq(sleepRecords.userId, userId));
  }

  async findByIdAndUserId(id: string, userId: string) {
    const db = await getDb();
    const [record] = await db.select()
      .from(sleepRecords)
      .where(and(
        eq(sleepRecords.id, id),
        eq(sleepRecords.userId, userId)
      ));
    
    return record || null;
  }

  async update(id: string, userId: string, data: UpdateSleepRecord) {
    const db = await getDb();
    const [updatedRecord] = await db.update(sleepRecords)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(
        eq(sleepRecords.id, id),
        eq(sleepRecords.userId, userId)
      ))
      .returning();

    return updatedRecord || null;
  }

  async delete(id: string, userId: string) {
    const db = await getDb();
    const result = await db.delete(sleepRecords)
      .where(and(
        eq(sleepRecords.id, id),
        eq(sleepRecords.userId, userId)
      ))
      .returning({ id: sleepRecords.id });

    return result.length > 0;
  }
} 