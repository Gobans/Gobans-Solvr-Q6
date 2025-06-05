import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { mkdir } from 'fs/promises'
import { dirname } from 'path'
import env from '../config/env'
import { users, sleepRecords } from './schema'
import { UserRole } from '../types'
import crypto from 'crypto'

// 데이터베이스 디렉토리 생성 함수
async function ensureDatabaseDirectory() {
  const dir = dirname(env.DATABASE_URL)
  try {
    await mkdir(dir, { recursive: true })
  } catch (error) {
    // 디렉토리가 이미 존재하는 경우 무시
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

// 초기 사용자 데이터
const initialUsers = [
  {
    name: '관리자',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '일반 사용자',
    email: 'user@example.com',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '게스트',
    email: 'guest@example.com',
    role: UserRole.GUEST,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// 초기 수면 데이터
const initialSleepRecords = [
  {
    userId: '', // 사용자 ID는 나중에 설정
    date: new Date('2024-03-20'),
    sleepStartTime: new Date('2024-03-20T23:00:00'),
    sleepEndTime: new Date('2024-03-21T07:00:00'),
    totalSleepHours: 8,
    quality: 4,
    notes: '편안한 수면',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: '', // 사용자 ID는 나중에 설정
    date: new Date('2024-03-21'),
    sleepStartTime: new Date('2024-03-21T23:30:00'),
    sleepEndTime: new Date('2024-03-22T06:30:00'),
    totalSleepHours: 7,
    quality: 3,
    notes: '약간의 불면증',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// 데이터베이스 마이그레이션 및 초기 데이터 삽입
async function runMigration() {
  try {
    // 데이터베이스 디렉토리 생성
    await ensureDatabaseDirectory()

    // 데이터베이스 연결
    const sqlite = new Database(env.DATABASE_URL)
    const db = drizzle(sqlite)

    // 스키마 생성
    console.log('데이터베이스 스키마 생성 중...')

    // users 테이블 생성
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'USER',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // sleep_records 테이블 생성
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sleep_records (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date INTEGER NOT NULL,
        sleep_start_time INTEGER NOT NULL,
        sleep_end_time INTEGER NOT NULL,
        total_sleep_hours INTEGER NOT NULL,
        quality INTEGER NOT NULL,
        notes TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // 초기 데이터 삽입
    console.log('초기 데이터 삽입 중...')

    // 기존 데이터 확인
    const existingUsers = db.select().from(users)

    if ((await existingUsers).length === 0) {
      // 초기 사용자 데이터 삽입
      for (const user of initialUsers) {
        const userId = crypto.randomUUID()
        await db.insert(users).values({
          ...user,
          id: userId,
        })

        // 각 사용자에 대한 수면 데이터 추가
        for (const sleepRecord of initialSleepRecords) {
          await db.insert(sleepRecords).values({
            ...sleepRecord,
            id: crypto.randomUUID(),
            userId: userId,
          })
        }
      }
      console.log(`${initialUsers.length}명의 사용자와 ${initialUsers.length * initialSleepRecords.length}개의 수면 기록이 추가되었습니다.`)
    } else {
      console.log('사용자 데이터가 이미 존재합니다. 초기 데이터 삽입을 건너뜁니다.')
    }

    console.log('데이터베이스 마이그레이션이 완료되었습니다.')
  } catch (error) {
    console.error('데이터베이스 마이그레이션 중 오류가 발생했습니다:', error)
    process.exit(1)
  }
}

// 스크립트가 직접 실행된 경우에만 마이그레이션 실행
if (require.main === module) {
  runMigration()
}

export default runMigration
