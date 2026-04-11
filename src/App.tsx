import { useEffect, useState, type ReactNode } from 'react'
import {
  Activity,
  BellRing,
  Building2,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  Move,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SquarePen,
  Users,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import {
  Responsive,
  WidthProvider,
  type Layout,
  type ResponsiveLayouts,
} from 'react-grid-layout/legacy'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './App.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

const LAYOUTS_STORAGE_KEY = 'eyeon-admin-layouts'
const VISIBLE_STORAGE_KEY = 'eyeon-admin-visible-widgets'

type WidgetId =
  | 'activeUsers'
  | 'riskUsers'
  | 'alertFeed'
  | 'hourlyTrend'
  | 'sessionTable'
  | 'policyCenter'

type PolicyKey = 'stage1' | 'stage2' | 'heartbeat' | 'nightMode'

type NavigationItem = {
  id: string
  label: string
  icon: typeof LayoutDashboard
  active?: boolean
}

type AlertItem = {
  user: string
  team: string
  level: 'L1' | 'L2'
  time: string
  note: string
}

type RiskUser = {
  name: string
  team: string
  riskScore: number
  sessionsToday: number
}

type SessionRow = {
  user: string
  mode: string
  duration: string
  events: string
  sync: '동기화 완료' | '재시도 필요'
}

type WidgetMeta = {
  id: WidgetId
  title: string
  eyebrow: string
  summary: string
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, active: true },
  { id: 'members', label: '구성원', icon: Users },
  { id: 'alerts', label: '이벤트', icon: BellRing },
  { id: 'policies', label: '정책', icon: ShieldCheck },
]

const widgetOrder: WidgetId[] = [
  'activeUsers',
  'riskUsers',
  'alertFeed',
  'hourlyTrend',
  'sessionTable',
  'policyCenter',
]

const widgetMeta: Record<WidgetId, WidgetMeta> = {
  activeUsers: {
    id: 'activeUsers',
    title: '활성 사용자',
    eyebrow: 'Live Overview',
    summary: '최근 5분 heartbeat 기준',
  },
  riskUsers: {
    id: 'riskUsers',
    title: '위험 사용자',
    eyebrow: 'Risk Queue',
    summary: '졸음 이벤트 빈도와 최근 세션 기준',
  },
  alertFeed: {
    id: 'alertFeed',
    title: '실시간 이벤트',
    eyebrow: 'Alert Feed',
    summary: '관리자 확인이 필요한 최근 이벤트',
  },
  hourlyTrend: {
    id: 'hourlyTrend',
    title: '시간대별 추이',
    eyebrow: 'Hourly Trend',
    summary: '시간대별 졸음 이벤트 발생량',
  },
  sessionTable: {
    id: 'sessionTable',
    title: '최근 세션',
    eyebrow: 'Session Log',
    summary: '동기화 상태까지 함께 확인',
  },
  policyCenter: {
    id: 'policyCenter',
    title: '정책 제어',
    eyebrow: 'Admin Controls',
    summary: '조직 단위 토글 목업',
  },
}

const defaultLayouts: ResponsiveLayouts = {
  lg: [
    { i: 'activeUsers', x: 0, y: 0, w: 4, h: 10 },
    { i: 'riskUsers', x: 4, y: 0, w: 4, h: 10 },
    { i: 'alertFeed', x: 8, y: 0, w: 4, h: 10 },
    { i: 'hourlyTrend', x: 0, y: 10, w: 6, h: 11 },
    { i: 'policyCenter', x: 6, y: 10, w: 6, h: 11 },
    { i: 'sessionTable', x: 0, y: 21, w: 12, h: 11 },
  ],
  md: [
    { i: 'activeUsers', x: 0, y: 0, w: 5, h: 10 },
    { i: 'riskUsers', x: 5, y: 0, w: 5, h: 10 },
    { i: 'alertFeed', x: 0, y: 10, w: 5, h: 10 },
    { i: 'hourlyTrend', x: 5, y: 10, w: 5, h: 11 },
    { i: 'policyCenter', x: 0, y: 21, w: 10, h: 10 },
    { i: 'sessionTable', x: 0, y: 31, w: 10, h: 11 },
  ],
  sm: [
    { i: 'activeUsers', x: 0, y: 0, w: 6, h: 10 },
    { i: 'riskUsers', x: 0, y: 10, w: 6, h: 10 },
    { i: 'alertFeed', x: 0, y: 20, w: 6, h: 10 },
    { i: 'hourlyTrend', x: 0, y: 30, w: 6, h: 11 },
    { i: 'policyCenter', x: 0, y: 41, w: 6, h: 11 },
    { i: 'sessionTable', x: 0, y: 52, w: 6, h: 11 },
  ],
  xs: [
    { i: 'activeUsers', x: 0, y: 0, w: 4, h: 10 },
    { i: 'riskUsers', x: 0, y: 10, w: 4, h: 10 },
    { i: 'alertFeed', x: 0, y: 20, w: 4, h: 10 },
    { i: 'hourlyTrend', x: 0, y: 30, w: 4, h: 11 },
    { i: 'policyCenter', x: 0, y: 41, w: 4, h: 11 },
    { i: 'sessionTable', x: 0, y: 52, w: 4, h: 11 },
  ],
  xxs: [
    { i: 'activeUsers', x: 0, y: 0, w: 2, h: 10 },
    { i: 'riskUsers', x: 0, y: 10, w: 2, h: 10 },
    { i: 'alertFeed', x: 0, y: 20, w: 2, h: 10 },
    { i: 'hourlyTrend', x: 0, y: 30, w: 2, h: 12 },
    { i: 'policyCenter', x: 0, y: 42, w: 2, h: 12 },
    { i: 'sessionTable', x: 0, y: 54, w: 2, h: 13 },
  ],
}

const organizations = ['HANSUNG DEMO ORG', 'FLEET TEAM 07', 'STUDY LAB A']

const alertItems: AlertItem[] = [
  {
    user: '김민수',
    team: '운수팀 A',
    level: 'L2',
    time: '22:31',
    note: '수면 상태 3.2초 지속',
  },
  {
    user: '박연우',
    team: '스터디룸 2',
    level: 'L1',
    time: '22:24',
    note: '졸음 상태 반복 감지',
  },
  {
    user: '이소율',
    team: '운수팀 C',
    level: 'L2',
    time: '22:10',
    note: '경고 자동 종료 후 재발생',
  },
  {
    user: '정하준',
    team: '업무팀 1',
    level: 'L1',
    time: '21:58',
    note: '장시간 무반응',
  },
]

const riskUsers: RiskUser[] = [
  { name: '김민수', team: '운수팀 A', riskScore: 93, sessionsToday: 4 },
  { name: '이소율', team: '운수팀 C', riskScore: 86, sessionsToday: 3 },
  { name: '박연우', team: '스터디룸 2', riskScore: 71, sessionsToday: 5 },
  { name: '정하준', team: '업무팀 1', riskScore: 68, sessionsToday: 2 },
]

const sessionRows: SessionRow[] = [
  {
    user: '김민수',
    mode: '운전',
    duration: '1h 42m',
    events: 'L1 3회 / L2 1회',
    sync: '동기화 완료',
  },
  {
    user: '최은재',
    mode: '스터디',
    duration: '52m',
    events: 'L1 1회',
    sync: '동기화 완료',
  },
  {
    user: '이소율',
    mode: '운전',
    duration: '2h 08m',
    events: 'L1 2회 / L2 2회',
    sync: '재시도 필요',
  },
  {
    user: '정하준',
    mode: '업무',
    duration: '37m',
    events: 'L1 1회',
    sync: '동기화 완료',
  },
]

const hourlyTrend = [
  { label: '08', value: 14 },
  { label: '10', value: 18 },
  { label: '12', value: 31 },
  { label: '14', value: 24 },
  { label: '16', value: 39 },
  { label: '18', value: 48 },
  { label: '20', value: 42 },
  { label: '22', value: 33 },
]

const policyDefinitions: Array<{
  key: PolicyKey
  title: string
  description: string
}> = [
  {
    key: 'stage1',
    title: '1단계 주의 알림',
    description: '약한 경고음과 진동을 활성화합니다.',
  },
  {
    key: 'stage2',
    title: '2단계 강한 경고',
    description: '붉은 경고 화면과 고강도 알림을 사용합니다.',
  },
  {
    key: 'heartbeat',
    title: '활성 사용자 heartbeat',
    description: '5분 이내 heartbeat 데이터를 대시보드에 반영합니다.',
  },
  {
    key: 'nightMode',
    title: '야간 민감도 강화',
    description: '21시 이후 감지 민감도를 한 단계 올립니다.',
  },
]

function readStoredLayouts(): ResponsiveLayouts {
  if (typeof window === 'undefined') {
    return defaultLayouts
  }

  const rawLayouts = window.localStorage.getItem(LAYOUTS_STORAGE_KEY)

  if (!rawLayouts) {
    return defaultLayouts
  }

  try {
    const parsed = JSON.parse(rawLayouts) as ResponsiveLayouts
    // 빈 상태이거나 유효하지 않은 레이아웃일 경우 대비
    if (!parsed || Object.keys(parsed).length === 0) {
      return defaultLayouts
    }
    return parsed
  } catch {
    return defaultLayouts
  }
}

function readStoredVisibleWidgets(): WidgetId[] {
  if (typeof window === 'undefined') {
    return widgetOrder
  }

  const rawWidgets = window.localStorage.getItem(VISIBLE_STORAGE_KEY)

  if (!rawWidgets) {
    return widgetOrder
  }

  try {
    const parsed = JSON.parse(rawWidgets) as WidgetId[]
    return parsed.length > 0 ? parsed : widgetOrder
  } catch {
    return widgetOrder
  }
}

function App() {
  const [editMode, setEditMode] = useState(false)
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(readStoredLayouts)
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetId[]>(
    readStoredVisibleWidgets,
  )
  const [selectedOrganization, setSelectedOrganization] = useState(
    organizations[0],
  )
  const [policies, setPolicies] = useState<Record<PolicyKey, boolean>>({
    stage1: true,
    stage2: true,
    heartbeat: true,
    nightMode: false,
  })

  useEffect(() => {
    window.localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(layouts))
  }, [layouts])

  useEffect(() => {
    window.localStorage.setItem(
      VISIBLE_STORAGE_KEY,
      JSON.stringify(visibleWidgets),
    )
  }, [visibleWidgets])

  const hiddenCount = widgetOrder.length - visibleWidgets.length

  function handleLayoutChange(_currentLayout: Layout, allLayouts: ResponsiveLayouts) {
    setLayouts((prevLayouts) => {
      const updatedLayouts = { ...prevLayouts }

      Object.keys(allLayouts).forEach((breakpoint) => {
        const bp = breakpoint as keyof ResponsiveLayouts
        const newBpLayout = allLayouts[bp] || []
        const prevBpLayout = prevLayouts[bp] || []

        const merged = [...prevBpLayout]
        newBpLayout.forEach((newItem) => {
          const index = merged.findIndex((item) => item.i === newItem.i)
          
          // 라이브러리가 새로 추가된 위젯에 대해 1x1 기본값을 보냈을 때,
          // 완전히 1x1 사이즈라면 (비정상 초기화), defaultLayouts에서 원래 크기를 가져와 강제로 복원합니다.
          let finalItem = { ...newItem }
          if (newItem.w === 1 && newItem.h === 1) {
            const defaultItem = defaultLayouts[bp]?.find((item) => item.i === newItem.i)
            if (defaultItem) {
              finalItem = { ...newItem, w: defaultItem.w, h: defaultItem.h, minW: defaultItem.w, minH: defaultItem.h }
            }
          }

          if (index > -1) {
            // 이미 존재하는 경우
            const prevItem = merged[index]
            // 만약 이전 크기가 유효하고, 새로 들어온게 1x1이라면, 기존 크기 유지.
            // 위에서 defaultItem으로 복구했을 수 있지만, 사용자가 수동으로 더 키워놓은 크기를 우선합니다.
            const isLikelyDefault =
              newItem.w === 1 &&
              newItem.h === 1 &&
              (prevItem.w > 1 || prevItem.h > 1)

            if (!isLikelyDefault) {
              merged[index] = finalItem
            }
          } else {
            // 새로 추가된 경우 (또는 숨겨졌다가 나타난 경우)
            merged.push(finalItem)
          }
        })
        updatedLayouts[bp] = merged
      })

      return updatedLayouts
    })
  }

  function toggleWidget(widgetId: WidgetId) {
    setVisibleWidgets((currentWidgets) => {
      const isActivating = !currentWidgets.includes(widgetId)

      if (isActivating) {
        // 위젯을 다시 켤 때, 만약 layouts 상태에 해당 위젯 정보가 없다면
        // defaultLayouts에서 해당 위젯의 정보를 미리 채워넣어 1x1 초기화를 방지합니다.
        setLayouts((prevLayouts) => {
          const updated = { ...prevLayouts }
          Object.keys(defaultLayouts).forEach((breakpoint) => {
            const bp = breakpoint as keyof ResponsiveLayouts
            const currentBpLayout = updated[bp] || []
            const hasWidget = currentBpLayout.some((item) => item.i === widgetId)

            if (!hasWidget) {
              const defaultItem = defaultLayouts[bp]?.find(
                (item) => item.i === widgetId,
              )
              if (defaultItem) {
                updated[bp] = [...currentBpLayout, defaultItem]
              }
            }
          })
          return updated
        })

        return [...currentWidgets, widgetId]
      }

      // 위젯을 끌 때 (최소 1개는 유지)
      if (currentWidgets.length === 1) {
        return currentWidgets
      }

      return currentWidgets.filter((currentWidget) => currentWidget !== widgetId)
    })
  }

  function togglePolicy(policyKey: PolicyKey) {
    setPolicies((currentPolicies) => ({
      ...currentPolicies,
      [policyKey]: !currentPolicies[policyKey],
    }))
  }

  function resetBoard() {
    setLayouts(defaultLayouts)
    setVisibleWidgets(widgetOrder)
    window.localStorage.removeItem(LAYOUTS_STORAGE_KEY)
    window.localStorage.removeItem(VISIBLE_STORAGE_KEY)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__badge">
            <ShieldAlert size={18} />
          </div>
          <div>
            <p className="eyebrow">Eye:on Admin</p>
            <strong>Monitoring Console</strong>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="관리자 메뉴">
          {navigationItems.map(({ id, label, icon: Icon, active }) => (
            <button
              key={id}
              type="button"
              className={`sidebar__nav-item${active ? ' is-active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} />
            </button>
          ))}
        </nav>

        <section className="sidebar__panel">
          <p className="eyebrow">Frontend Scope</p>
          <h2>백엔드 팀원과 맞출 계약</h2>
          <ul className="sidebar__list">
            <li>`GET /admin/dashboard`</li>
            <li>`GET /admin/members`</li>
            <li>`GET /admin/sessions/:id`</li>
            <li>`PUT /admin/policies`</li>
          </ul>
        </section>

        <section className="sidebar__panel sidebar__panel--muted">
          <p className="eyebrow">Current Note</p>
          <p className="sidebar__note">
            지금 화면은 목업 데이터 기준입니다. 팀원이 API를 만들면
            컴포넌트의 데이터 소스만 교체하면 됩니다.
          </p>
        </section>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar__copy">
            <p className="eyebrow">Block-Based Dashboard</p>
            <h1>조직 관리자 대시보드 프론트 스타터</h1>
            <p className="topbar__description">
              수정 가능한 위젯 보드, 정책 제어, 세션 로그, 위험 사용자 큐를 한
              화면에서 다루는 형태로 구성했습니다.
            </p>
          </div>

          <div className="topbar__controls">
            <label className="select-field">
              <Building2 size={16} />
              <select
                aria-label="조직 선택"
                value={selectedOrganization}
                onChange={(event) => setSelectedOrganization(event.target.value)}
              >
                {organizations.map((organization) => (
                  <option key={organization} value={organization}>
                    {organization}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className={`ghost-button${editMode ? ' is-active' : ''}`}
              onClick={() => setEditMode((currentMode) => !currentMode)}
            >
              <SquarePen size={16} />
              {editMode ? '편집 종료' : '편집 모드'}
            </button>

            <button type="button" className="ghost-button" onClick={resetBoard}>
              <RotateCcw size={16} />
              레이아웃 초기화
            </button>
          </div>
        </header>

        <section className="hero-strip">
          <SummaryCard
            icon={Wifi}
            label="현재 활성 사용자"
            value="128"
            detail="최근 5분 heartbeat 기준"
          />
          <SummaryCard
            icon={ShieldAlert}
            label="오늘 위험 사용자"
            value="14"
            detail="L2 발생 또는 누적 위험도 70점 이상"
          />
          <SummaryCard
            icon={BellRing}
            label="금일 경고 이벤트"
            value="53"
            detail="L1 39건 / L2 14건"
          />
          <SummaryCard
            icon={Clock3}
            label="평균 세션 길이"
            value="56m"
            detail="조직 전체, 최근 7일 기준"
          />
        </section>

        <section className="board-section">
          <div className="board-section__header">
            <div>
              <p className="eyebrow">Workspace Board</p>
              <h2>{selectedOrganization}</h2>
            </div>
            <div className="board-section__meta">
              <span>{editMode ? '위젯 이동/크기 변경 가능' : '읽기 모드'}</span>
              <span>{hiddenCount > 0 ? `숨김 ${hiddenCount}개` : '전체 표시 중'}</span>
            </div>
          </div>

          {editMode ? (
            <section className="widget-library" aria-label="위젯 표시 설정">
              {widgetOrder.map((widgetId) => {
                const meta = widgetMeta[widgetId]
                const isVisible = visibleWidgets.includes(widgetId)

                return (
                  <button
                    key={widgetId}
                    type="button"
                    className={`widget-library__chip${isVisible ? ' is-on' : ''}`}
                    onClick={() => toggleWidget(widgetId)}
                  >
                    <span>{meta.title}</span>
                    <small>{isVisible ? '표시 중' : '숨김'}</small>
                  </button>
                )
              })}
            </section>
          ) : null}

          <ResponsiveGridLayout
            className={`workspace-board${editMode ? ' is-editing' : ''}`}
            layouts={layouts}
            breakpoints={{ lg: 1000, md: 800, sm: 640, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={40}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            draggableHandle=".widget-shell__header"
            isDraggable={editMode}
            isResizable={editMode}
            onLayoutChange={handleLayoutChange}
          >
            {visibleWidgets.map((widgetId) => {
              const defaultGridItem = defaultLayouts.lg?.find((l) => l.i === widgetId)
              return (
                <div key={widgetId} data-grid={defaultGridItem}>
                  <WidgetShell meta={widgetMeta[widgetId]} editMode={editMode}>
                    {renderWidget(widgetId, policies, togglePolicy)}
                  </WidgetShell>
                </div>
              )
            })}
          </ResponsiveGridLayout>
        </section>
      </main>
    </div>
  )
}

function renderWidget(
  widgetId: WidgetId,
  policies: Record<PolicyKey, boolean>,
  onTogglePolicy: (policyKey: PolicyKey) => void,
) {
  switch (widgetId) {
    case 'activeUsers':
      return <ActiveUsersWidget />
    case 'riskUsers':
      return <RiskUsersWidget />
    case 'alertFeed':
      return <AlertFeedWidget />
    case 'hourlyTrend':
      return <HourlyTrendWidget />
    case 'sessionTable':
      return <SessionTableWidget />
    case 'policyCenter':
      return (
        <PolicyCenterWidget policies={policies} onTogglePolicy={onTogglePolicy} />
      )
    default:
      return null
  }
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon
  label: string
  value: string
  detail: string
}) {
  return (
    <article className="summary-card">
      <div className="summary-card__icon">
        <Icon size={24} />
      </div>
      <div>
        <p className="summary-card__label">{label}</p>
        <strong className="summary-card__value">{value}</strong>
        <p className="summary-card__detail">{detail}</p>
      </div>
    </article>
  )
}

function WidgetShell({
  meta,
  editMode,
  children,
}: {
  meta: WidgetMeta
  editMode: boolean
  children: ReactNode
}) {
  return (
    <section className="widget-shell">
      <header
        className="widget-shell__header"
        style={{ cursor: editMode ? 'grab' : 'default' }}
      >
        <div>
          <p className="eyebrow">{meta.eyebrow}</p>
          <h3>{meta.title}</h3>
          <p className="widget-shell__summary">{meta.summary}</p>
        </div>
        {editMode ? (
          <div className="widget-shell__edit-pill">
            <Move size={14} />
            이동
          </div>
        ) : null}
      </header>
      <div className="widget-shell__body">{children}</div>
    </section>
  )
}

function ActiveUsersWidget() {
  return (
    <div className="widget-stack">
      <div className="hero-stat">
        <div>
          <p className="hero-stat__label">조직 전체 활성</p>
          <strong className="hero-stat__value">128</strong>
        </div>
        <div className="hero-stat__badge">+12 from 10m ago</div>
      </div>

      <div className="metric-grid">
        <MetricItem label="운전 모드" value="54" tone="blue" />
        <MetricItem label="스터디 모드" value="49" tone="sand" />
        <MetricItem label="업무 모드" value="25" tone="emerald" />
      </div>

      <div className="mini-panel">
        <div className="mini-panel__row">
          <span>오늘 신규 가입</span>
          <strong>+18</strong>
        </div>
        <div className="mini-panel__row">
          <span>동기화 실패 세션</span>
          <strong>3</strong>
        </div>
      </div>
    </div>
  )
}

function MetricItem({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'blue' | 'sand' | 'emerald'
}) {
  return (
    <div className={`metric-item metric-item--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function RiskUsersWidget() {
  return (
    <div className="widget-stack">
      {riskUsers.map((user) => (
        <article key={user.name} className="risk-row">
          <div className="risk-row__copy">
            <div>
              <strong>{user.name}</strong>
              <span>{user.team}</span>
            </div>
            <span className="risk-row__sessions">{user.sessionsToday}세션</span>
          </div>
          <div className="risk-row__bar">
            <div style={{ width: `${user.riskScore}%` }} />
          </div>
          <div className="risk-row__footer">
            <span>위험도 {user.riskScore}</span>
            <button type="button">상세 보기</button>
          </div>
        </article>
      ))}
    </div>
  )
}

function AlertFeedWidget() {
  return (
    <div className="widget-stack">
      {alertItems.map((item, index) => (
        <article key={`${item.user}-${item.time}-${index}`} className="feed-row">
          <div className="feed-row__head">
            <div>
              <strong>{item.user}</strong>
              <span>{item.team}</span>
            </div>
            <span className={`feed-row__level feed-row__level--${item.level}`}>
              {item.level}
            </span>
          </div>
          <p className="feed-row__note">{item.note}</p>
          <div className="feed-row__meta">
            <span>{item.time}</span>
            <button type="button">이벤트 열기</button>
          </div>
        </article>
      ))}
    </div>
  )
}

function HourlyTrendWidget() {
  return (
    <div className="widget-stack">
      <div className="chart-header">
        <div>
          <span>금일 피크 시간</span>
          <strong>18:00</strong>
        </div>
        <div>
          <span>최대 이벤트 수</span>
          <strong>48건</strong>
        </div>
      </div>

      <div className="bar-chart" aria-label="시간대별 졸음 이벤트 차트">
        {hourlyTrend.map((point) => (
          <div key={point.label} className="bar-chart__item">
            <div className="bar-chart__column">
              <div style={{ height: `${point.value * 1.7}px` }} />
            </div>
            <strong>{point.value}</strong>
            <span>{point.label}</span>
          </div>
        ))}
      </div>

      <div className="compare-strip">
        <div>
          <span>운전 모드</span>
          <strong>62%</strong>
        </div>
        <div>
          <span>스터디 모드</span>
          <strong>28%</strong>
        </div>
        <div>
          <span>업무 모드</span>
          <strong>10%</strong>
        </div>
      </div>
    </div>
  )
}

function SessionTableWidget() {
  return (
    <div className="widget-stack">
      <div className="search-strip">
        <div className="search-strip__input">
          <Search size={16} />
          <span>사용자 또는 세션 검색</span>
        </div>
        <button type="button">필터</button>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>사용자</th>
              <th>모드</th>
              <th>시간</th>
              <th>이벤트</th>
              <th>동기화</th>
            </tr>
          </thead>
          <tbody>
            {sessionRows.map((row) => (
              <tr key={`${row.user}-${row.mode}`}>
                <td>{row.user}</td>
                <td>{row.mode}</td>
                <td>{row.duration}</td>
                <td>{row.events}</td>
                <td>
                  <span
                    className={`sync-badge${
                      row.sync === '동기화 완료' ? ' is-good' : ' is-bad'
                    }`}
                  >
                    {row.sync}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PolicyCenterWidget({
  policies,
  onTogglePolicy,
}: {
  policies: Record<PolicyKey, boolean>
  onTogglePolicy: (policyKey: PolicyKey) => void
}) {
  return (
    <div className="widget-stack">
      {policyDefinitions.map((policy) => (
        <article key={policy.key} className="policy-row">
          <div className="policy-row__copy">
            <strong>{policy.title}</strong>
            <p>{policy.description}</p>
          </div>
          <button
            type="button"
            className={`policy-toggle${policies[policy.key] ? ' is-on' : ''}`}
            onClick={() => onTogglePolicy(policy.key)}
            aria-pressed={policies[policy.key]}
          >
            <span />
          </button>
        </article>
      ))}

      <div className="policy-footer">
        <div className="policy-footer__metric">
          <Activity size={16} />
          최근 저장
          <strong>2분 전</strong>
        </div>
        <button type="button" className="policy-footer__button">
          정책 저장
        </button>
      </div>
    </div>
  )
}

export default App
