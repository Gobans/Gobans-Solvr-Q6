import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SleepRecord, NewSleepRecord } from '../types/sleep';
import { sleepApi, SleepInsights } from '../api/sleep';
import SleepStatistics from '../components/SleepStatistics';

export default function SleepRecords() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.userName || '사용자';
  const [activeTab, setActiveTab] = useState<'records' | 'statistics'>('records');
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [insights, setInsights] = useState<SleepInsights | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SleepRecord | null>(null);
  const [formData, setFormData] = useState<NewSleepRecord>({
    date: new Date().toISOString().split('T')[0],
    sleepStartTime: '23:00',
    sleepEndTime: '07:00',
    totalSleepHours: 8,
    quality: 3,
    notes: '',
  });

  useEffect(() => {
    if (userId) {
      fetchRecords();
      fetchInsights();
    }
  }, [userId]);

  const fetchRecords = async () => {
    if (!userId) return;
    
    try {
      const data = await sleepApi.getSleepRecords(userId);
      setRecords(data);
    } catch (error) {
      console.error('수면 기록 조회 중 오류 발생:', error);
    }
  };

  const fetchInsights = async () => {
    if (!userId) return;
    
    try {
      const data = await sleepApi.getSleepInsights(userId);
      setInsights(data);
    } catch (error) {
      console.error('수면 인사이트 조회 중 오류 발생:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    try {
      if (editingRecord) {
        await sleepApi.updateSleepRecord(editingRecord.id, formData, userId);
      } else {
        await sleepApi.createSleepRecord(formData, userId);
      }
      setIsModalOpen(false);
      setEditingRecord(null);
      fetchRecords();
      fetchInsights(); // 통계도 다시 불러오기
    } catch (error) {
      console.error('수면 기록 저장 중 오류 발생:', error);
    }
  };

  const handleEdit = (record: SleepRecord) => {
    setEditingRecord(record);
    setFormData({
      date: new Date(record.date).toISOString().split('T')[0],
      sleepStartTime: formatTimeForInput(record.sleepStartTime),
      sleepEndTime: formatTimeForInput(record.sleepEndTime),
      totalSleepHours: record.totalSleepHours,
      quality: record.quality,
      notes: record.notes || '',
    });
    setIsModalOpen(true);
  };

  // 시간을 HH:MM 형식으로 변환하는 함수
  const formatTimeForInput = (timestamp: string | number | Date): string => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', timestamp);
        return '00:00';
      }
      
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '00:00';
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    
    if (window.confirm('정말로 이 수면 기록을 삭제하시겠습니까?')) {
      try {
        await sleepApi.deleteSleepRecord(id, userId);
        fetchRecords();
        fetchInsights(); // 통계도 다시 불러오기
      } catch (error) {
        console.error('수면 기록 삭제 중 오류 발생:', error);
      }
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">잘못된 접근입니다</h1>
          <p className="text-gray-600">사용자 ID가 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{userName}의 수면 기록</h1>
            <p className="text-gray-600 mt-1">수면 패턴을 기록하고 관리하세요</p>
          </div>
          <button
            onClick={() => {
              setEditingRecord(null);
              setFormData({
                date: new Date().toISOString().split('T')[0],
                sleepStartTime: '23:00',
                sleepEndTime: '07:00',
                totalSleepHours: 8,
                quality: 3,
                notes: '',
              });
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            새 기록 추가
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('records')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'records'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📝 수면 기록
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'statistics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 통계 & 분석
              </button>
            </nav>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'records' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* 데스크톱 테이블 뷰 */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수면 시간</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 수면 시간</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수면 품질</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">특이사항</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.sleepStartTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(record.sleepEndTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.totalSleepHours}시간</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {'⭐'.repeat(record.quality)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{record.notes || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 뷰 */}
            <div className="md:hidden">
              {records.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  아직 수면 기록이 없습니다.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {records.map((record) => (
                    <div key={record.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString('ko-KR')}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            {new Date(record.sleepStartTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} - {' '}
                            {new Date(record.sleepEndTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">총 수면 시간:</span>
                          <div className="font-medium">{record.totalSleepHours}시간</div>
                        </div>
                        <div>
                          <span className="text-gray-500">수면 품질:</span>
                          <div className="font-medium">{'⭐'.repeat(record.quality)}</div>
                        </div>
                      </div>
                      
                      {record.notes && (
                        <div className="text-sm">
                          <span className="text-gray-500">특이사항:</span>
                          <div className="mt-1 text-gray-900">{record.notes}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'statistics' && insights && (
          <SleepStatistics insights={insights} />
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingRecord ? '수면 기록 수정' : '새 수면 기록'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">날짜</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">취침 시간</label>
                    <input
                      type="time"
                      value={formData.sleepStartTime}
                      onChange={(e) => setFormData({ ...formData, sleepStartTime: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">기상 시간</label>
                    <input
                      type="time"
                      value={formData.sleepEndTime}
                      onChange={(e) => setFormData({ ...formData, sleepEndTime: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">총 수면 시간</label>
                    <input
                      type="number"
                      value={formData.totalSleepHours}
                      onChange={(e) => setFormData({ ...formData, totalSleepHours: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      max="24"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">수면 품질</label>
                    <select
                      value={formData.quality}
                      onChange={(e) => setFormData({ ...formData, quality: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="1">⭐</option>
                      <option value="2">⭐⭐</option>
                      <option value="3">⭐⭐⭐</option>
                      <option value="4">⭐⭐⭐⭐</option>
                      <option value="5">⭐⭐⭐⭐⭐</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">특이사항</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    저장
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 