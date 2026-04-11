# Eye:on Admin Frontend

조직 관리자용 대시보드 프론트 스타터입니다.

현재 포함된 것:
- 수정 가능한 블록형 대시보드
- 드래그/리사이즈 가능한 위젯 보드
- `localStorage` 기반 레이아웃 저장
- 조직 선택 UI
- 정책 토글 목업
- 세션/이벤트/위험 사용자 목업 데이터

## 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 추천 연결 방식

백엔드는 팀원이 만들고, 프론트는 아래 응답 형태만 맞추면 됩니다.

- `GET /admin/dashboard`
- `GET /admin/members`
- `GET /admin/sessions/:sessionId`
- `PUT /admin/policies`

## 프론트 작업 포인트

- 목업 데이터는 [`src/App.tsx`](/home/tsalthsu/EJClaw/groups/discord_personal-codex/eyeon-admin/src/App.tsx) 상단에 모여 있습니다.
- 스타일은 [`src/App.css`](/home/tsalthsu/EJClaw/groups/discord_personal-codex/eyeon-admin/src/App.css), [`src/index.css`](/home/tsalthsu/EJClaw/groups/discord_personal-codex/eyeon-admin/src/index.css)에서 수정하면 됩니다.
- 위젯 추가/삭제는 `widgetMeta`, `widgetOrder`, `defaultLayouts`를 같이 수정하면 됩니다.

## 다음 단계

1. 팀원과 API 응답 스키마 확정
2. 목업 데이터를 `fetch`/`axios` 호출로 교체
3. 정책 저장 버튼에 실제 `PUT /admin/policies` 연결
4. 세션 상세/구성원 상세 화면 분리
