import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 먼저 기존 사용자인지 확인
      const checkResponse = await fetch(`http://localhost:8000/api/users?name=${encodeURIComponent(nickname.trim())}`);
      
      if (checkResponse.ok) {
        const result = await checkResponse.json();
        
        // 기존 사용자가 있는 경우
        if (result.success && result.data.length > 0) {
          const user = result.data[0];
          console.log('기존 사용자 발견:', user);
          navigate(`/sleep-records/${user.id}`, {
            state: { userName: user.name }
          });
          return;
        }
      }

      // 기존 사용자가 없는 경우 새로 생성
      const createResponse = await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nickname.trim(),
          email: `${nickname.trim().toLowerCase().replace(/\s+/g, '')}@sleep.app` // 임시 이메일
        }),
      });

      if (!createResponse.ok) {
        throw new Error('사용자 생성에 실패했습니다.');
      }

      const createResult = await createResponse.json();
      console.log('새 사용자 생성 응답:', createResult);
      
      if (createResult.success && createResult.data) {
        const newUser = createResult.data;
        navigate(`/sleep-records/${newUser.id}`, {
          state: { userName: newUser.name }
        });
      } else {
        throw new Error('사용자 생성 응답이 올바르지 않습니다.');
      }
      
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">수면 기록 관리</h1>
          <p className="text-gray-600">닉네임을 입력하여 시작하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="닉네임을 입력하세요"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !nickname.trim()}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '처리 중...' : '시작하기'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>• 기존 닉네임이면 바로 수면 기록을 확인할 수 있습니다</p>
          <p>• 새로운 닉네임이면 자동으로 계정을 만들어드립니다</p>
        </div>
      </div>
    </div>
  );
} 