// Swagger 설명서 기반의 API 데이터 타입 정의

export interface LoginResponse {
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  role: 'ADMIN' | 'USER';
}

export interface MeResponse {
  userId: string;
  email: string;
  role: string;
  organizationCode: string;
  name: string;
  nickname: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
}

export interface RealtimeSummaryResponse {
  totalMemberCount: number;
  activeSessionCount: number;
  warningSessionCount: number;
  drowsyWarningSessionCount: number;
  sleepWarningSessionCount: number;
}
