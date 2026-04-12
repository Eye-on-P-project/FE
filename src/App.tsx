import { useEffect, useState, type ReactNode } from 'react'
import {
  Activity,
  BellRing,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  Lock,
  LogOut,
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
}

type AlertItem = {
  user: string
  team: string
  level: 'L1' | 'L2'
  date: string
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
  date: string
  startTime: string
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
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'members', label: '구성원', icon: Users },
  { id: 'alerts', label: '이벤트', icon: BellRing },
  { id: 'statistics', label: '통계', icon: Activity },
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

const alertItems: AlertItem[] = [
  {
    user: '김민수',
    team: '운수팀 A',
    level: 'L2',
    date: '2026-04-11',
    time: '22:31',
    note: '수면 상태 3.2초 지속',
  },
  {
    user: '박연우',
    team: '스터디룸 2',
    level: 'L1',
    date: '2026-04-10',
    time: '22:24',
    note: '졸음 상태 반복 감지',
  },
  {
    user: '이소율',
    team: '운수팀 C',
    level: 'L2',
    date: '2026-04-11',
    time: '22:10',
    note: '경고 자동 종료 후 재발생',
  },
  {
    user: '정하준',
    team: '업무팀 1',
    level: 'L1',
    date: '2026-04-01',
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
    date: '2026-04-11',
    startTime: '20:49',
    duration: '1h 42m',
    events: 'L1 3회 / L2 1회',
    sync: '동기화 완료',
  },
  {
    user: '최은재',
    mode: '스터디',
    date: '2026-04-10',
    startTime: '21:40',
    duration: '52m',
    events: 'L1 1회',
    sync: '동기화 완료',
  },
  {
    user: '이소율',
    mode: '운전',
    date: '2026-04-11',
    startTime: '20:02',
    duration: '2h 08m',
    events: 'L1 2회 / L2 2회',
    sync: '재시도 필요',
  },
  {
    user: '정하준',
    mode: '업무',
    date: '2026-04-01',
    startTime: '21:21',
    duration: '37m',
    events: 'L1 1회',
    sync: '동기화 완료',
  },
  {
    user: '김도현',
    mode: '운전',
    date: '2026-03-25',
    startTime: '18:15',
    duration: '4h 10m',
    events: 'L1 2회',
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

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 임시로 아무거나 적어도 로그인 성공
    onLogin()
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--color-brand, #0f3d3e)', 
            borderRadius: '16px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'white'
          }}>
            <Lock size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0' }}>관리자 로그인</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Eye-on 관제 시스템에 접속합니다.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>이메일</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '1px solid var(--color-border)',
                background: '#f9fafb'
              }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '1px solid var(--color-border)',
                background: '#f9fafb'
              }}
              required
            />
          </div>
          <button 
            type="submit" 
            className="ghost-button" 
            style={{ 
              width: '100%', 
              background: 'var(--color-brand, #0f3d3e)', 
              color: 'white', 
              fontWeight: 600,
              height: '3.5rem',
              marginTop: '12px'
            }}
          >
            로그인
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
          계정 정보를 잊으셨나요? <a href="#" onClick={(e) => { e.preventDefault(); alert('관리자에게 문의하세요.'); }} style={{ color: 'var(--color-brand)', fontWeight: 600 }}>문의하기</a>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [editMode, setEditMode] = useState(false)
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(readStoredLayouts)
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetId[]>(
    readStoredVisibleWidgets,
  )
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [policies, setPolicies] = useState<Record<PolicyKey, boolean>>({
    stage1: true,
    stage2: true,
    heartbeat: true,
    nightMode: false,
  })
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<string | null>(null)
  
  const [statType, setStatType] = useState<'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('hourly')
  const [statStartDate, setStatStartDate] = useState('2026-04-04')
  const [statEndDate, setStatEndDate] = useState('2026-04-11')

  const getWeekStr = (dateStr: string) => {
    const date = new Date(dateStr)
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
  }

  const getWeekOfMonthStr = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const firstDay = new Date(year, date.getMonth(), 1).getDay()
    const weekNo = Math.ceil((day + (firstDay === 0 ? 6 : firstDay - 1)) / 7)
    return `${year}-${month}월 ${weekNo}주차`
  }

  const [alertFilterStartDate, setAlertFilterStartDate] = useState('2026-04-04')
  const [alertFilterEndDate, setAlertFilterEndDate] = useState('2026-04-11')
  const [alertFilterLevel, setAlertFilterLevel] = useState<'all' | 'L1' | 'L2'>('all')
  const [selectedStatGroup, setSelectedStatGroup] = useState<{ key: string, items: AlertItem[] } | null>(null)

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

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />
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
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`sidebar__nav-item${activeTab === id ? ' is-active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} />
            </button>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
            <button
              type="button"
              className="sidebar__nav-item"
              onClick={() => setIsLoggedIn(false)}
              style={{ color: '#d95d39' }}
            >
              <LogOut size={18} />
              <span>로그아웃</span>
            </button>
          </div>
        </nav>


      </aside>

      <main className="workspace">
        {activeTab === 'dashboard' && (
          <>
            <header className="topbar">
              <div className="topbar__copy">
                <p className="eyebrow">Real-time Monitoring</p>
                <h1>통합 관제 대시보드</h1>
                <p className="topbar__description">
                  실시간 위험 사용자 탐지, 세션 분석 및 조직 정책 제어 기능을 통합하여
                  조직의 안전과 효율성을 한눈에 관리할 수 있습니다.
                </p>
              </div>

              <div className="topbar__controls">
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
                  <h2>전체 조직</h2>
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
                        {renderWidget(
                          widgetId, 
                          policies, 
                          togglePolicy, 
                          setActiveTab, 
                          (userName) => {
                            setActiveTab('members');
                            setSelectedUserForDetail(userName);
                          }
                        )}
                      </WidgetShell>
                    </div>
                  )
                })}
              </ResponsiveGridLayout>
            </section>
          </>
        )}

        {activeTab === 'members' && (
          <>
            <header className="topbar">
              <div className="topbar__copy">
                <p className="eyebrow">Organization Roster</p>
                <h1>구성원 관리 시스템</h1>
                <p className="topbar__description">
                  조직 구성원의 실시간 활동 현황과 위험도 이력을 조회하고,
                  상세 세션 로그를 통해 체계적인 인원 관리를 지원합니다.
                </p>
              </div>

            </header>
            <section className="board-section">
              <div className="board-section__header">
                <div>
                  <p className="eyebrow">Directory</p>
                  <h2>전체 조직 세부 정책</h2>
                </div>
                <div className="search-strip" style={{ marginBottom: 0 }}>
                  <div className="search-strip__input">
                    <Search size={16} />
                    <span>이름 또는 부서 검색</span>
                  </div>
                </div>
              </div>
              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>사용자</th>
                      <th>소속</th>
                      <th>금일 세션 수</th>
                      <th>최근 위험도 점수</th>
                      <th>상태</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskUsers.map((user) => (
                      <tr key={user.name}>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.team}</td>
                        <td>{user.sessionsToday}회</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ minWidth: '30px' }}>{user.riskScore}</span>
                            <div style={{ flex: 1, height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${user.riskScore}%`, height: '100%', background: user.riskScore > 80 ? 'var(--color-danger, #ef4444)' : user.riskScore > 60 ? 'var(--color-warning, #f59e0b)' : 'var(--color-success, #10b981)' }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`sync-badge is-good`}>활성</span>
                        </td>
                        <td>
                          <button type="button" className="ghost-button" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setSelectedUserForDetail(user.name)}>상세 정보</button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td><strong>최은재</strong></td>
                      <td>스터디룸 1</td>
                      <td>1회</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ minWidth: '30px' }}>12</span>
                          <div style={{ flex: 1, height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `12%`, height: '100%', background: 'var(--color-success, #10b981)' }} />
                          </div>
                        </div>
                      </td>
                      <td><span className={`sync-badge`}>오프라인</span></td>
                      <td><button type="button" className="ghost-button" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setSelectedUserForDetail('최은재')}>상세 정보</button></td>
                    </tr>
                    <tr>
                      <td><strong>김도현</strong></td>
                      <td>운수팀 B</td>
                      <td>2회</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ minWidth: '30px' }}>45</span>
                          <div style={{ flex: 1, height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `45%`, height: '100%', background: 'var(--color-success, #10b981)' }} />
                          </div>
                        </div>
                      </td>
                      <td><span className={`sync-badge`}>오프라인</span></td>
                      <td><button type="button" className="ghost-button" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setSelectedUserForDetail('김도현')}>상세 정보</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === 'alerts' && (() => {
          const filteredAlerts = alertItems.filter(item => {
            const itemDate = new Date(item.date).getTime()
            const start = new Date(alertFilterStartDate).getTime()
            const end = new Date(alertFilterEndDate).getTime()
            if (itemDate < start || itemDate > end) return false

            if (alertFilterLevel !== 'all' && item.level !== alertFilterLevel) return false

            return true
          })

          const handleExportCSV = () => {
            const headers = ['날짜', '발생 시간', '사용자', '소속', '경고 단계', '상세 내용']
            const rows = filteredAlerts.map(a => [a.date, a.time, a.user, a.team, a.level, a.note])
            const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n")
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `alerts_export_${alertFilterStartDate}_${alertFilterEndDate}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }

          return (
            <>
              <header className="topbar">
                <div className="topbar__copy">
                  <p className="eyebrow">Alert History</p>
                  <h1>졸음 및 위험 감지 로그</h1>
                  <p className="topbar__description">
                    시스템에 의해 감지된 모든 위험 이벤트를 실시간으로 기록하며,
                    과거 이력 조회 및 정밀한 분석 데이터를 제공합니다.
                  </p>
                </div>
              </header>
              <section className="board-section">
                <div className="board-section__header">
                  <div>
                    <p className="eyebrow">Event Log</p>
                    <h2>전체 조직 세부 정책</h2>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="ghost-button" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => {
                      setAlertFilterStartDate('2026-04-11');
                      setAlertFilterEndDate('2026-04-11');
                    }}>오늘</button>
                    <button type="button" className="ghost-button" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => {
                      setAlertFilterStartDate('2026-04-04');
                      setAlertFilterEndDate('2026-04-11');
                    }}>최근 7일</button>
                    <button type="button" className="ghost-button" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => {
                      setAlertFilterStartDate('2026-04-01');
                      setAlertFilterEndDate('2026-04-30');
                    }}>이번 달</button>
                    <button type="button" className="ghost-button" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => {
                      setAlertFilterStartDate('2026-01-01');
                      setAlertFilterEndDate('2026-12-31');
                    }}>올해</button>
                  </div>
                </div>
                <div className="search-strip" style={{ marginBottom: 0, background: 'none', border: 'none', padding: '12px 0', gap: '16px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>조회 기간:</label>
                    <input type="date" value={alertFilterStartDate} onChange={(e) => setAlertFilterStartDate(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-fg)', fontSize: '0.85rem' }} />
                    <span style={{ fontSize: '0.85rem' }}>~</span>
                    <input type="date" value={alertFilterEndDate} onChange={(e) => setAlertFilterEndDate(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-fg)', fontSize: '0.85rem' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>단계:</label>
                    <select 
                      value={alertFilterLevel} 
                      onChange={(e) => setAlertFilterLevel(e.target.value as any)}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-fg)', fontSize: '0.85rem' }}
                    >
                      <option value="all">모든 단계</option>
                      <option value="L1">L1 주의</option>
                      <option value="L2">L2 경고</option>
                    </select>
                  </div>
                  <button type="button" className="ghost-button" style={{ marginLeft: 'auto', background: '#eee', color: '#000', fontWeight: 600 }} onClick={handleExportCSV}>내보내기 (CSV)</button>
                </div>
                <div className="table-shell">
                  <table>
                    <thead>
                      <tr>
                        <th>날짜</th>
                        <th>발생 시간</th>
                        <th>사용자</th>
                        <th>소속</th>
                        <th>경고 단계</th>
                        <th>상세 내용</th>
                        <th>조치 상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAlerts.length > 0 ? (
                        filteredAlerts.map((item, i) => (
                          <tr key={i}>
                            <td>{item.date}</td>
                            <td>{item.time}</td>
                            <td><strong>{item.user}</strong></td>
                            <td>{item.team}</td>
                            <td>
                              <span className={`feed-row__level feed-row__level--${item.level}`}>
                                {item.level}
                              </span>
                            </td>
                            <td>{item.note}</td>
                            <td>
                              {item.level === 'L2' ? (
                                <span className="sync-badge is-bad">확인 필요</span>
                              ) : (
                                <span className="sync-badge is-good">자동 종료됨</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted)' }}>
                            해당 조건에 맞는 이벤트가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )
        })()}

        {activeTab === 'statistics' && (() => {
          const filteredStats = alertItems.filter(item => {
            if (statType === 'hourly' || statType === 'daily') {
              const itemDate = new Date(item.date).getTime()
              const start = new Date(statStartDate).getTime()
              const end = new Date(statEndDate).getTime()
              return !(itemDate < start || itemDate > end)
            } else if (statType === 'weekly') {
              const itemWeek = getWeekStr(item.date)
              // Comparison assumes statStartDate/End are in YYYY-Www format when type=week
              return itemWeek >= statStartDate && itemWeek <= statEndDate
            } else if (statType === 'monthly') {
              const itemMonth = item.date.substring(0, 7)
              return itemMonth >= statStartDate.substring(0, 7) && itemMonth <= statEndDate.substring(0, 7)
            } else if (statType === 'yearly') {
              const itemYear = item.date.substring(0, 4)
              return itemYear >= statStartDate.substring(0, 4) && itemYear <= statEndDate.substring(0, 4)
            }
            return true
          })

          const groupedStats = filteredStats.reduce((acc, item) => {
            let key = ''
            const dateObj = new Date(item.date)
            if (statType === 'hourly') {
              const hour = parseInt(item.time.split(':')[0])
              key = `${item.date} ${String(hour).padStart(2, '0')}:00 ~ ${String(hour + 1).padStart(2, '0')}:00`
            } else if (statType === 'daily') {
              key = item.date
            } else if (statType === 'weekly') {
              key = getWeekOfMonthStr(item.date)
            } else if (statType === 'monthly') {
              key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}월`
            } else if (statType === 'yearly') {
              key = `${dateObj.getFullYear()}년`
            }

            if (!acc[key]) {
              acc[key] = { key, total: 0, l1: 0, l2: 0, items: [] as AlertItem[] }
            }
            acc[key].total += 1
            if (item.level === 'L1') acc[key].l1 += 1
            if (item.level === 'L2') acc[key].l2 += 1
            acc[key].items.push(item)

            return acc
          }, {} as Record<string, { key: string, total: number, l1: number, l2: number, items: AlertItem[] }>)

          const statResult = Object.values(groupedStats).sort((a, b) => b.key.localeCompare(a.key))
          const statMax = Math.max(...statResult.map(r => r.total), 1)

          const handleViewEvents = (key: string, items: AlertItem[]) => {
            setSelectedStatGroup({ key, items });
          }

          const renderDatePickers = () => {
            const commonStyle = { padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-fg)', fontSize: '0.85rem' }
            
            if (statType === 'hourly' || statType === 'daily') {
              return (
                <>
                  <input type="date" value={statStartDate} onChange={(e) => setStatStartDate(e.target.value)} style={commonStyle} />
                  <span>~</span>
                  <input type="date" value={statEndDate} onChange={(e) => setStatEndDate(e.target.value)} style={commonStyle} />
                </>
              )
            } else if (statType === 'weekly') {
              return (
                <>
                  <input type="week" value={statStartDate.includes('W') ? statStartDate : getWeekStr(statStartDate)} onChange={(e) => setStatStartDate(e.target.value)} style={commonStyle} />
                  <span>~</span>
                  <input type="week" value={statEndDate.includes('W') ? statEndDate : getWeekStr(statEndDate)} onChange={(e) => setStatEndDate(e.target.value)} style={commonStyle} />
                </>
              )
            } else if (statType === 'monthly') {
              return (
                <>
                  <input type="month" value={statStartDate.substring(0, 7)} onChange={(e) => setStatStartDate(e.target.value + '-01')} style={commonStyle} />
                  <span>~</span>
                  <input type="month" value={statEndDate.substring(0, 7)} onChange={(e) => setStatEndDate(e.target.value + '-01')} style={commonStyle} />
                </>
              )
            } else if (statType === 'yearly') {
              const years = ['2024', '2025', '2026']
              return (
                <>
                  <select value={statStartDate.substring(0, 4)} onChange={(e) => setStatStartDate(e.target.value + '-01-01')} style={commonStyle}>
                    {years.map(y => <option key={y} value={y}>{y}년</option>)}
                  </select>
                  <span>~</span>
                  <select value={statEndDate.substring(0, 4)} onChange={(e) => setStatEndDate(e.target.value + '-01-01')} style={commonStyle}>
                    {years.map(y => <option key={y} value={y}>{y}년</option>)}
                  </select>
                </>
              )
            }
          }

          return (
            <>
              <header className="topbar">
                <div className="topbar__copy">
                  <p className="eyebrow">Statistics & Trends</p>
                  <h1>졸음 발생 패턴 및 통계 분석</h1>
                  <p className="topbar__description">
                    시간대별, 기간별 다각도 통계 데이터를 통해 조직 내 졸음 취약 구간을 파악하고
                    안전 정책 수립을 위한 핵심 인사이트를 제공합니다.
                  </p>
                </div>
              </header>
              
              <section className="board-section">
                <div className="board-section__header">
                  <div>
                    <p className="eyebrow">Data Table</p>
                    <h2>상세 통계 데이터</h2>
                  </div>
                  <div className="search-strip" style={{ marginBottom: 0, background: 'none', border: 'none', padding: 0 }}>
                    <button type="button" className={`ghost-button${statType === 'hourly' ? ' is-active' : ''}`} onClick={() => { setStatType('hourly'); setStatStartDate('2026-04-04'); setStatEndDate('2026-04-11'); }}>시간대</button>
                    <button type="button" className={`ghost-button${statType === 'daily' ? ' is-active' : ''}`} onClick={() => { setStatType('daily'); setStatStartDate('2026-04-04'); setStatEndDate('2026-04-11'); }}>일</button>
                    <button type="button" className={`ghost-button${statType === 'weekly' ? ' is-active' : ''}`} onClick={() => { setStatType('weekly'); setStatStartDate('2026-W10'); setStatEndDate('2026-W15'); }}>주</button>
                    <button type="button" className={`ghost-button${statType === 'monthly' ? ' is-active' : ''}`} onClick={() => { setStatType('monthly'); setStatStartDate('2026-01-01'); setStatEndDate('2026-12-31'); }}>월</button>
                    <button type="button" className={`ghost-button${statType === 'yearly' ? ' is-active' : ''}`} onClick={() => { setStatType('yearly'); setStatStartDate('2024-01-01'); setStatEndDate('2026-12-31'); }}>년</button>
                  </div>
                </div>

                <div className="widget-stack" style={{ background: 'var(--color-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', marginTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>조회 기간:</label>
                      {renderDatePickers()}
                    </div>
                    
                    <button type="button" className="ghost-button" style={{ background: '#eee', color: '#000', padding: '6px 16px', fontWeight: 600 }}>적용</button>
                    <button type="button" className="ghost-button" style={{ padding: '6px 16px' }} onClick={() => {
                      setStatType('hourly')
                      setStatStartDate('2026-04-04')
                      setStatEndDate('2026-04-11')
                    }}>초기화</button>
                  </div>

                  {statResult.length > 0 ? (
                    <div className="table-shell">
                      <table style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th>기준 ({statType === 'hourly' ? '시간대' : statType === 'daily' ? '일' : statType === 'weekly' ? '주' : statType === 'monthly' ? '월' : '년'})</th>
                            <th>총 이벤트 수</th>
                            <th>L1 주의 알림</th>
                            <th>L2 졸음 경고</th>
                            <th>발생 비율</th>
                            <th>관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statResult.map(row => {
                            const percentage = Math.round((row.total / statMax) * 100)
                            return (
                              <tr key={row.key}>
                                <td>{row.key}</td>
                                <td><strong>{row.total}건</strong></td>
                                <td>{row.l1}건</td>
                                <td>{row.l2}건</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ minWidth: '40px' }}>{percentage}%</span>
                                    <div style={{ flex: 1, height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                                      <div style={{ width: `${percentage}%`, height: '100%', background: percentage > 50 ? 'var(--color-danger, #ef4444)' : 'var(--color-warning, #f59e0b)' }} />
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <button type="button" className="ghost-button" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleViewEvents(row.key, row.items)}>이벤트 확인</button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: '32px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '8px', color: 'var(--color-muted)' }}>
                      해당 조건에 맞는 통계 데이터가 없습니다.
                    </div>
                  )}

                </div>
              </section>
            </>
          )
        })()}

        {activeTab === 'policies' && (
          <>
            <header className="topbar">
              <div className="topbar__copy">
                <p className="eyebrow">Policy Management</p>
                <h1>전사 안전 운영 정책 설정</h1>
                <p className="topbar__description">
                  감지 민감도, 경고 알림 단계 및 사용자 피드백 방식을 조정하여
                  조직 환경에 최적화된 맞춤형 안전 가이드라인을 수립합니다.
                </p>
              </div>

            </header>
            <section className="board-section">
              <div className="board-section__header">
                <div>
                  <p className="eyebrow">Global Settings</p>
                  <h2>전체 조직 세부 정책</h2>
                </div>
                <button type="button" className="ghost-button" style={{ background: 'var(--color-fg)', color: 'var(--color-bg)' }}>
                  변경 사항 저장
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '16px' }}>
                <div className="widget-stack" style={{ background: 'var(--color-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>알림 및 경고 활성화</h3>
                  {policyDefinitions.map((policy) => (
                    <article key={policy.key} className="policy-row" style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)', background: 'transparent' }}>
                      <div className="policy-row__copy">
                        <strong>{policy.title}</strong>
                        <p style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--color-muted)' }}>{policy.description}</p>
                      </div>
                      <button
                        type="button"
                        className={`policy-toggle${policies[policy.key] ? ' is-on' : ''}`}
                        onClick={() => togglePolicy(policy.key)}
                        aria-pressed={policies[policy.key]}
                      >
                        <span />
                      </button>
                    </article>
                  ))}
                </div>

                <div className="widget-stack" style={{ background: 'var(--color-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>상세 민감도 설정</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>1단계 주의 알림 민감도</label>
                      <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-fg)' }}>
                        <option>보통 (기본값)</option>
                        <option>민감 (빠른 감지)</option>
                        <option>둔감 (오탐 최소화)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>2단계 경고 알림 민감도</label>
                      <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-fg)' }}>
                        <option>보통 (기본값)</option>
                        <option>민감 (빠른 감지)</option>
                        <option>둔감 (오탐 최소화)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>1단계 알림음 설정</label>
                      <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-fg)' }}>
                        <option>기본 알림음 1 (띠링)</option>
                        <option>기본 알림음 2 (부드러운 소리)</option>
                        <option>진동만</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>2단계 경고음 설정</label>
                      <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-fg)' }}>
                        <option>기본 경고음 1 (강한 사이렌)</option>
                        <option>기본 경고음 2 (연속 비프음)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      {selectedUserForDetail && <UserDetailModal userName={selectedUserForDetail} onClose={() => setSelectedUserForDetail(null)} />}
      {selectedStatGroup && <StatEventModal groupKey={selectedStatGroup.key} items={selectedStatGroup.items} onClose={() => setSelectedStatGroup(null)} />}
    </div>
  )
}

function renderWidget(
  widgetId: WidgetId,
  policies: Record<PolicyKey, boolean>,
  onTogglePolicy: (policyKey: PolicyKey) => void,
  setActiveTab: (tab: string) => void,
  onShowUserDetail: (userName: string) => void,
) {
  switch (widgetId) {
    case 'activeUsers':
      return <ActiveUsersWidget />
    case 'riskUsers':
      return <RiskUsersWidget onShowUserDetail={onShowUserDetail} />
    case 'alertFeed':
      return <AlertFeedWidget setActiveTab={setActiveTab} />
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

function RiskUsersWidget({ onShowUserDetail }: { onShowUserDetail?: (userName: string) => void }) {
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
            <button type="button" onClick={() => onShowUserDetail?.(user.name)}>상세 보기</button>
          </div>
        </article>
      ))}
    </div>
  )
}

function AlertFeedWidget({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
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
            <button type="button" onClick={() => setActiveTab?.('alerts')}>이벤트 열기</button>
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
        <button type="button" className="policy-footer__button" onClick={() => alert('정책이 성공적으로 저장되었습니다.')}>
          정책 저장
        </button>
      </div>
    </div>
  )
}

function StatEventModal({ groupKey, items, onClose }: { groupKey: string, items: AlertItem[], onClose: () => void }) {
  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
      <div className="modal-content" style={{ background: 'var(--color-bg)', width: '100%', maxWidth: '800px', maxHeight: '90vh', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <header style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)' }}>
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>통계 상세 이력</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '1.25rem' }}>{groupKey} <span style={{ fontSize: '0.9rem', color: 'var(--color-muted)', fontWeight: 'normal', marginLeft: '8px' }}>발생 이벤트 목록</span></h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose} style={{ padding: '8px' }}>닫기</button>
        </header>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div className="table-shell">
            <table style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>발생 시간</th>
                  <th>사용자</th>
                  <th>소속</th>
                  <th>경고 단계</th>
                  <th>상세 내용</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.time}</td>
                    <td><strong>{item.user}</strong></td>
                    <td>{item.team}</td>
                    <td>
                      <span className={`feed-row__level feed-row__level--${item.level}`}>
                        {item.level}
                      </span>
                    </td>
                    <td>{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserDetailModal({ userName, onClose }: { userName: string, onClose: () => void }) {
  const [filterDays, setFilterDays] = useState<number | null>(7)

  const userRisk = riskUsers.find(u => u.name === userName) || { name: userName, team: '미상', riskScore: 0, sessionsToday: 0 }
  
  const filterByDate = (dateStr: string) => {
    if (filterDays === null) return true
    const itemDate = new Date(dateStr).getTime()
    const today = new Date('2026-04-11').getTime()
    const diffDays = (today - itemDate) / (1000 * 3600 * 24)
    return diffDays <= filterDays && diffDays >= 0
  }

  const userAlerts = alertItems.filter(a => a.user === userName && filterByDate(a.date))
  const userSessions = sessionRows.filter(s => s.user === userName && filterByDate(s.date))

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
      <div className="modal-content" style={{ background: 'var(--color-bg)', width: '100%', maxWidth: '800px', maxHeight: '90vh', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <header style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)' }}>
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>구성원 상세</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '1.25rem' }}>{userName} <span style={{ fontSize: '0.9rem', color: 'var(--color-muted)', fontWeight: 'normal', marginLeft: '8px' }}>{userRisk.team}</span></h2>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select 
              value={filterDays === null ? 'all' : filterDays.toString()} 
              onChange={(e) => setFilterDays(e.target.value === 'all' ? null : Number(e.target.value))}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-fg)', fontSize: '0.9rem' }}
            >
              <option value="7">최근 7일</option>
              <option value="30">최근 30일</option>
              <option value="all">전체 기간</option>
            </select>
            <button type="button" className="ghost-button" onClick={onClose} style={{ padding: '8px' }}>닫기</button>
          </div>
        </header>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <section>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} />
              졸음 이벤트 로그 ({userAlerts.length}건)
            </h3>
            {userAlerts.length > 0 ? (
              <div className="table-shell">
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>발생 시간</th>
                      <th>경고 단계</th>
                      <th>상세 내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAlerts.map((alert, i) => (
                      <tr key={i}>
                        <td>{alert.date}</td>
                        <td>{alert.time}</td>
                        <td>
                          <span className={`feed-row__level feed-row__level--${alert.level}`}>
                            {alert.level}
                          </span>
                        </td>
                        <td>{alert.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '8px', color: 'var(--color-muted)' }}>
                해당 기간에 발생한 졸음 이벤트가 없습니다.
              </div>
            )}
          </section>

          <section>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock3 size={18} />
              세션 (서버 접속) 로그 ({userSessions.length}건)
            </h3>
            {userSessions.length > 0 ? (
              <div className="table-shell">
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>시작 시간</th>
                      <th>모드</th>
                      <th>러닝 타임</th>
                      <th>이벤트 요약</th>
                      <th>동기화 상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSessions.map((session, i) => (
                      <tr key={i}>
                        <td>{session.date}</td>
                        <td>{session.startTime}</td>
                        <td>{session.mode}</td>
                        <td>{session.duration}</td>
                        <td>{session.events || '-'}</td>
                        <td>
                          <span className={`sync-badge${session.sync === '동기화 완료' ? ' is-good' : ' is-bad'}`}>
                            {session.sync}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '8px', color: 'var(--color-muted)' }}>
                해당 기간에 기록된 세션이 없습니다.
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}

export default App
