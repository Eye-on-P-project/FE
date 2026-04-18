import axios from 'axios';

// 백엔드 기본 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 주소
  withCredentials: true, // 쿠키(Refresh Token) 자동 전송
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

// Response Interceptor: 401 에러(토큰 만료 등) 발생 시 자동 갱신(Refresh) 처리
apiClient.interceptors.response.use(
  (response) => response, // 성공 응답은 그대로 통과
  async (error) => {
    const originalRequest = error.config;
    
    // 이미 한 번 재시도 했거나(무한 루프 방지), 에러가 401이 아니면 그냥 에러 반환
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    originalRequest._retry = true; // 무한 루프 방지용 플래그
    
    // 만약 Refresh 관련 요청 자체가 401이면 (Refresh Token도 만료된 경우) 완전 로그아웃 처리 필요
    if (originalRequest.url.includes('/api/auth/refresh')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      window.location.href = '/'; // 강제 로그아웃
      return Promise.reject(error);
    }

    try {
      // Refresh API 호출 (WEB 클라이언트이므로 refreshToken은 쿠키로 자동 전송됨)
      const res = await axios.post('http://localhost:8080/api/auth/refresh', {}, {
        withCredentials: true,
        headers: { 'X-Client-Type': 'WEB' }
      });
      const { accessToken } = res.data;
      
      // 새 토큰 저장
      localStorage.setItem('accessToken', accessToken);
      
      // 기존 요청 헤더를 새 토큰으로 업데이트 후 다시 전송
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // 갱신 실패 (완전 만료 등) 시 로그아웃
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      window.location.href = '/';
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
