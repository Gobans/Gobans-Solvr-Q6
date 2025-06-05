import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types/sleep';

interface ApiResponse {
  success: boolean;
  data: User[];
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('http://localhost:8000/api/users');
        if (!response.ok) {
          throw new Error('사용자 목록 조회에 실패했습니다.');
        }
        const result = await response.json() as ApiResponse;
        
        if (result.success && Array.isArray(result.data)) {
          setUsers(result.data);
        } else {
          console.error('API 응답이 올바르지 않습니다:', result);
          setError('데이터 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('사용자 목록 조회 중 오류 발생:', error);
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">수면 기록 관리</h1>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">사용자 선택</h2>
            {users.length === 0 ? (
              <div className="text-center text-gray-500">등록된 사용자가 없습니다.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/sleep-records/${user.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 