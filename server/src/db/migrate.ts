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
  },
  {
    name: '당근이',
    email: 'carrot@sleep.app',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// 차트 테스트용 더미 수면 데이터 (당근이 전용)
const carrotSleepRecords = [
  // 최근 2주간의 수면 기록
  {
    date: new Date('2024-12-05'), // 목요일
    sleepStartTime: new Date('2024-12-05T23:30:00'),
    sleepEndTime: new Date('2024-12-06T07:30:00'),
    totalSleepHours: 8,
    quality: 4,
    notes: '깊은 잠'
  },
  {
    date: new Date('2024-12-06'), // 금요일
    sleepStartTime: new Date('2024-12-07T02:00:00'),
    sleepEndTime: new Date('2024-12-07T07:00:00'),
    totalSleepHours: 5,
    quality: 2,
    notes: '완벽한 수면'
  },
  {
    date: new Date('2024-12-07'), // 토요일
    sleepStartTime: new Date('2024-12-07T00:30:00'),
    sleepEndTime: new Date('2024-12-07T09:00:00'),
    totalSleepHours: 8.5,
    quality: 4,
    notes: '주말 늦잠'
  },
  {
    date: new Date('2024-12-08'), // 일요일
    sleepStartTime: new Date('2024-12-08T00:00:00'),
    sleepEndTime: new Date('2024-12-08T08:30:00'),
    totalSleepHours: 8.5,
    quality: 3,
    notes: '조금 피곤함'
  },
  {
    date: new Date('2024-12-09'), // 월요일
    sleepStartTime: new Date('2024-12-09T23:15:00'),
    sleepEndTime: new Date('2024-12-10T06:45:00'),
    totalSleepHours: 7.5,
    quality: 3,
    notes: '월요병'
  },
  {
    date: new Date('2024-12-10'), // 화요일
    sleepStartTime: new Date('2024-12-10T23:45:00'),
    sleepEndTime: new Date('2024-12-11T07:15:00'),
    totalSleepHours: 7.5,
    quality: 4,
    notes: '적응중'
  },
  {
    date: new Date('2024-12-11'), // 수요일
    sleepStartTime: new Date('2024-12-11T23:00:00'),
    sleepEndTime: new Date('2024-12-12T07:00:00'),
    totalSleepHours: 8,
    quality: 4,
    notes: '좋은 하루'
  },
  {
    date: new Date('2024-12-12'), // 목요일
    sleepStartTime: new Date('2024-12-12T22:45:00'),
    sleepEndTime: new Date('2024-12-13T06:30:00'),
    totalSleepHours: 7.75,
    quality: 5,
    notes: '일찍 잠'
  },
  {
    date: new Date('2024-12-13'), // 금요일
    sleepStartTime: new Date('2024-12-14T02:30:00'),
    sleepEndTime: new Date('2024-12-14T07:30:00'),
    totalSleepHours: 5,
    quality: 2,
    notes: '금요일 밤'
  },
  {
    date: new Date('2024-12-14'), // 토요일
    sleepStartTime: new Date('2024-12-14T01:00:00'),
    sleepEndTime: new Date('2024-12-14T09:30:00'),
    totalSleepHours: 8.5,
    quality: 3,
    notes: '늦게 잠'
  },
  {
    date: new Date('2024-12-15'), // 일요일
    sleepStartTime: new Date('2024-12-15T00:15:00'),
    sleepEndTime: new Date('2024-12-15T08:15:00'),
    totalSleepHours: 8,
    quality: 4,
    notes: '일요일 휴식'
  },
  {
    date: new Date('2024-12-16'), // 월요일
    sleepStartTime: new Date('2024-12-16T23:00:00'),
    sleepEndTime: new Date('2024-12-17T07:00:00'),
    totalSleepHours: 8,
    quality: 3,
    notes: '새로운 한 주'
  },
  {
    date: new Date('2024-12-17'), // 화요일
    sleepStartTime: new Date('2024-12-17T22:30:00'),
    sleepEndTime: new Date('2024-12-18T06:30:00'),
    totalSleepHours: 8,
    quality: 5,
    notes: '최고의 컨디션'
  },
  {
    date: new Date('2024-12-18'), // 수요일
    sleepStartTime: new Date('2024-12-18T23:15:00'),
    sleepEndTime: new Date('2024-12-19T07:00:00'),
    totalSleepHours: 7.75,
    quality: 4,
    notes: '적당한 피로감'
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

        // 사용자별 수면 데이터 추가
        if (user.name === '당근이') {
          // 당근이에게는 차트 테스트용 풍부한 데이터 추가
          for (const sleepRecord of carrotSleepRecords) {
            await db.insert(sleepRecords).values({
              id: crypto.randomUUID(),
              userId: userId,
              date: sleepRecord.date,
              sleepStartTime: sleepRecord.sleepStartTime,
              sleepEndTime: sleepRecord.sleepEndTime,
              totalSleepHours: sleepRecord.totalSleepHours,
              quality: sleepRecord.quality,
              notes: sleepRecord.notes,
              createdAt: new Date(),
              updatedAt: new Date()
            })
          }
          console.log(`당근이에게 ${carrotSleepRecords.length}개의 테스트 수면 기록을 추가했습니다.`)
        } else {
          // 다른 사용자에게는 기본 수면 데이터 추가
          for (const sleepRecord of initialSleepRecords) {
            await db.insert(sleepRecords).values({
              ...sleepRecord,
              id: crypto.randomUUID(),
              userId: userId,
            })
          }
        }
      }
      console.log(`${initialUsers.length}명의 사용자가 추가되었습니다.`)
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
