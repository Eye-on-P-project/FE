# Eye:on FE

Eye:on(아이온)은 스마트폰 전면 카메라 + 온디바이스 AI 기반 졸음/피로 감지 서비스입니다.  
목표는 규칙 기반 MVP를 고도화하고, 개인 앱을 넘어 조직 관리형 서비스까지 확장하는 것입니다.

이 `FE` 디렉토리는 **조직 관리자용 웹 포털(Admin Portal)** 을 담당합니다.  
(운전/스터디/조직 모드의 실시간 감지는 모바일 앱 도메인)

## 1) FE 역할

- 조직 단위 실시간 모니터링 대시보드
- 위험 사용자/알림/세션/분석 통계 조회
- 구성원 관리(조회/추가/삭제)
- 인증(로그인/회원가입/세션 복구/로그아웃)
- 백엔드 실시간 SSE 구독 및 경고 상태 반영

## 2) 현재 구현 범위

### 인증
- 로그인/회원가입 UI
- Access Token 메모리 저장 + Refresh 기반 세션 복구
- 401 응답 시 자동 토큰 재발급 후 재시도 인터셉터

### 대시보드
- 위젯 편집(드래그/리사이즈)
- 위젯 가시성 토글
- 레이아웃/가시성 `localStorage` 저장
- 24시간 위험 발생 추이(LineChart)
- 실시간 요약(총 구성원/활성 세션/경고 세션)

### 실시간 모니터링
- SSE 스트림 구독(`/realtime-summary/stream`)
- 요약/알림 이벤트 반영
- 진행중 경고 패널

### 알림 기록
- 알림 목록 조회(커서 기반 페이지네이션)
- 기간/단계 필터
- CSV 내보내기

### 구성원 관리
- 구성원 목록 조회
- 이메일 기반 구성원 추가
- 구성원 삭제

### 분석
- 시간대/일/주/월/년 단위 통계 조회
- 기간 필터
- Top 5 위험 사용자 표시

## 3) 기획서 기준 기능 정렬

문서의 기준은 아래 두 가지입니다.

- 서비스 기획서(운전/스터디/조직 모드 확장)
- 기능명세 CSV(세션 제어, 탐지 로직, 경고, 설정, 통계, 시스템 항목)

정렬 원칙:

- 모바일 탐지 로직/경고 제어(카메라, EAR/PERCLOS, 경고음, 포그라운드 서비스)는 모바일 앱 영역
- 조직 통계/모니터링/관리자 기능은 현재 `FE` 웹 포털에서 구현

## 4) 기술 스택

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Axios
- Recharts
- react-grid-layout
- react-hot-toast
- lucide-react

## 5) 실행 방법

### 요구 사항
- Node.js 20+
- npm 10+

### 설치/실행
```bash
cd FE
npm install
npm run dev
```

### 프로덕션 빌드
```bash
cd FE
npm run build
npm run preview
```

## 6) 환경 변수

`FE/.env`

```env
VITE_API_BASE_URL=http://api.eyeon.company:8080
```

## 7) API 연동 계약 (현재 코드 기준)

### Auth
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### User/Organization
- `GET /api/users/me`
- `GET /api/users/dev/organizations`
- `GET /api/organizations/members`
- `POST /api/organizations/members`
- `DELETE /api/organizations/members/{memberId}`

### Monitoring/Analytics
- `GET /api/monitoring/dashboard/hourly-risk-24h`
- `GET /api/monitoring/dashboard/recent-ended-sessions?limit=...`
- `GET /api/monitoring/dashboard/notifications?limit=...&cursor=...`
- `GET /api/monitoring/dashboard/realtime-summary/stream` (SSE)
- `GET /api/organizations/{organizationId}/risk-users`
- `GET /api/organizations/{organizationId}/analysis/risk-stats`

## 8) 주요 파일 구조

```text
FE/
  src/
    App.tsx                 # 관리자 포털 단일 페이지 UI/상태/탭 로직
    api/
      client.ts             # axios 클라이언트, 토큰/refresh 인터셉터
      monitoring.ts         # 대시보드/통계/SSE API
      members.ts            # 구성원 관리 API
    data/mockData.ts        # fallback/mock 데이터 + 위젯 기본 배치
    types/
      api.ts                # 백엔드 응답 타입
      index.ts              # UI 도메인 타입
    index.css               # 글로벌 스타일 + grid override
```

## 9) 참고

- 이 저장소의 FE는 현재 관리자 웹에 집중되어 있으며, 모바일 온디바이스 추론 자체는 별도 모듈에서 담당합니다.
