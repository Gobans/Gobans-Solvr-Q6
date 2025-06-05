import { SleepInsights, SleepDiagnosis } from '../types/sleep';
import env from '../config/env';

export class AIDiagnosisService {
  private model: string = 'gemini-2.0-flash';

  private generatePrompt(insights: SleepInsights): string {
    return `
당신은 수면 전문가입니다. 아래의 수면 데이터를 분석하여 사용자의 수면 상태를 진단하고 개선 방안을 제시해주세요.

[수면 데이터 분석]
- 총 기록 수: ${insights.totalRecords}일
- 평균 수면 시간: ${insights.averageSleepHours}시간
- 평균 취침 시간: ${insights.averageBedtime || '기록 없음'}
- 평균 기상 시간: ${insights.averageWakeTime || '기록 없음'}

[요일별 평균 수면 시간]
${insights.weeklyAverages.map(day => `- ${day.day}: ${day.averageHours}시간 (${day.recordCount}일 기록)`).join('\n')}

[수면 품질 분포]
${insights.qualityDistribution.map(q => `- ${q.quality}점: ${q.percentage}%`).join('\n')}

다음 형식으로 응답해주세요:
1. 진단: 사용자의 수면 상태에 대한 전문적인 분석
2. 개선 방안: 구체적이고 실천 가능한 3가지 이상의 개선 방안
3. 위험도: low/medium/high 중 하나로 평가
4. 수면 점수: 0-100 사이의 점수

응답은 JSON 형식으로 해주세요:
{
  "diagnosis": "진단 내용",
  "recommendations": ["개선 방안 1", "개선 방안 2", "개선 방안 3"],
  "riskLevel": "low/medium/high",
  "sleepScore": 85
}
`;
  }

  async diagnoseSleep(insights: SleepInsights): Promise<SleepDiagnosis> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: env.GEMINI_API_KEY,
      });

      const prompt = this.generatePrompt(insights);
      const response = await ai.models.generateContent({
        model: this.model,
        contents: prompt
      });

      if (!response.text) {
        throw new Error('AI 응답이 비어있습니다.');
      }

      return JSON.parse(response.text) as SleepDiagnosis;
    } catch (error) {
      console.error('AI 진단 중 오류 발생:', error);
      throw new Error('수면 진단을 수행할 수 없습니다.');
    }
  }
} 