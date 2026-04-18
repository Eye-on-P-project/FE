// Swagger 설명서 기반의 API 데이터 타입 정의

export interface LoginResponse {
  userId: number;
  accessToken: string;
  refreshToken: string;
  role: 'ADMIN' | 'USER';
}

export interface MeResponse {
  userId: number;
  email: string;
  role: 'ADMIN' | 'USER';
  organizationCode: string;
  name: string;
  nickname: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
}
