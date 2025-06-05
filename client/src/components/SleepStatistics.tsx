import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { SleepInsights, SleepDiagnosis } from '../types/sleep';
import { useEffect, useState } from 'react';
import sleepApi from '../api/sleep';

interface SleepStatisticsProps {
  insights: SleepInsights;
  userId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function SleepStatistics({ insights, userId }: SleepStatisticsProps) {
  const [diagnosis, setDiagnosis] = useState<SleepDiagnosis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnosis = async () => {
      if (insights.totalRecords === 0) return;
      
      try {
        setLoading(true);
        const diagnosisData = await sleepApi.getSleepDiagnosis(insights, userId);
        setDiagnosis(diagnosisData);
      } catch (err) {
        setError('AI 진단을 불러오는데 실패했습니다.');
        console.error('Error fetching diagnosis:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnosis();
  }, [insights, userId]);

  if (insights.totalRecords === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="mb-4">
          <svg 
            className="mx-auto h-24 w-24 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">아직 통계 데이터가 없습니다</h3>
        <p className="text-gray-600 mb-6">
          수면 기록을 추가하면 유용한 인사이트와 통계를 확인할 수 있습니다.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            💡 <strong>팁:</strong> 최소 3-7일의 수면 기록이 있어야 정확한 통계를 볼 수 있어요!
          </p>
        </div>
      </div>
    );
  }

  // 요일별 데이터를 정렬 (월요일부터 시작)
  const sortedWeeklyData = [
    ...insights.weeklyAverages.slice(1), // 월~토
    insights.weeklyAverages[0] // 일요일을 마지막으로
  ].filter(item => item.recordCount > 0);

  // 품질 분포 데이터 준비
  const qualityData = insights.qualityDistribution.map(item => ({
    ...item,
    name: `${item.quality}점 (${item.count}회)`
  }));

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* 전체 통계 개요 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 수면 통계 개요</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{insights.totalRecords}일</div>
            <div className="text-sm text-gray-600">총 기록 일수</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{insights.averageSleepHours}시간</div>
            <div className="text-sm text-gray-600">평균 수면 시간</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{insights.averageBedtime}</div>
            <div className="text-sm text-gray-600">평균 취침 시간</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{insights.averageWakeTime}</div>
            <div className="text-sm text-gray-600">평균 기상 시간</div>
          </div>
        </div>
      </div>

      {/* 요일별 수면 시간 차트 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 요일별 평균 수면 시간</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={sortedWeeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`${value}시간`, '평균 수면 시간']}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="averageHours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 수면 품질 분포 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ 수면 품질 분포</h3>
        <div className="flex flex-col md:flex-row items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={qualityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {qualityData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}회`, '기록 수']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI 수면 진단 */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      ) : diagnosis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI 수면 진단</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium mb-2">진단 결과</h4>
              <p className="text-gray-700">{diagnosis.diagnosis}</p>
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">수면 점수</h4>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold">{diagnosis.sleepScore}</div>
                <div className={`text-lg font-medium ${getRiskLevelColor(diagnosis.riskLevel)}`}>
                  {diagnosis.riskLevel === 'low' && '양호'}
                  {diagnosis.riskLevel === 'medium' && '주의'}
                  {diagnosis.riskLevel === 'high' && '위험'}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">권장사항</h4>
              <ul className="list-disc list-inside space-y-2">
                {diagnosis.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 