import axios from 'axios';

// 백엔드 기본 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 주소
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'WEB', // 설명서(Swagger)의 필수 헤더
  },
});

// (선택사항) 토큰이 생기면 모든 요청에 자동으로 넣어주는 기능
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
