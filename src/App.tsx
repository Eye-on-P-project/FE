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
  SquarePen,
  UserCircle,
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

type NavigationItem = {
  id: string
  label: string
  icon: LucideIcon
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
  date: string
  startTime: string
  duration: string
  alerts: string
}

type WidgetMeta = {
  id: WidgetId
  title: string
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'members', label: '구성원', icon: Users },
  { id: 'alerts', label: '알림', icon: BellRing },
  { id: 'statistics', label: '통계', icon: Activity },
]

const widgetOrder: WidgetId[] = [
  'activeUsers',
  'riskUsers',
  'alertFeed',
  'hourlyTrend',
  'sessionTable',
]

const widgetMeta: Record<WidgetId, WidgetMeta> = {
  activeUsers: {
    id: 'activeUsers',
    title: '실시간 현황',
  },
  riskUsers: {
    id: 'riskUsers',
    title: '위험 사용자 큐',
  },
  alertFeed: {
    id: 'alertFeed',
    title: '실시간 알림',
  },
  hourlyTrend: {
    id: 'hourlyTrend',
    title: '졸음 발생 추이',
  },
  sessionTable: {
    id: 'sessionTable',
    title: '최근 접속 세션',
  },
}

const defaultLayouts: ResponsiveLayouts = {
  lg: [
    { i: 'activeUsers', x: 0, y: 0, w: 4, h: 10 },
    { i: 'riskUsers', x: 4, y: 0, w: 4, h: 10 },
    { i: 'alertFeed', x: 8, y: 0, w: 4, h: 10 },
    { i: 'hourlyTrend', x: 0, y: 10, w: 6, h: 11 },
    { i: 'sessionTable', x: 6, y: 10, w: 6, h: 11 },
  ],
  md: [
    { i: 'activeUsers', x: 0, y: 0, w: 5, h: 10 },
    { i: 'riskUsers', x: 5, y: 0, w: 5, h: 10 },
    { i: 'alertFeed', x: 0, y: 10, w: 5, h: 10 },
    { i: 'hourlyTrend', x: 5, y: 10, w: 5, h: 11 },
    { i: 'sessionTable', x: 0, y: 21, w: 10, h: 11 },
  ],
  sm: [
    { i: 'activeUsers', x: 0, y: 0, w: 6, h: 10 },
    { i: 'riskUsers', x: 0, y: 10, w: 6, h: 10 },
    { i: 'alertFeed', x: 0, y: 20, w: 6, h: 10 },
    { i: 'hourlyTrend', x: 0, y: 30, w: 6, h: 11 },
    { i: 'sessionTable', x: 0, y: 41, w: 6, h: 11 },
  ],
  xs: [
    { i: 'activeUsers', x: 0, y: 0, w: 4, h: 10 },
    { i: 'riskUsers', x: 0, y: 10, w: 4, h: 10 },
    { i: 'alertFeed', x: 0, y: 20, w: 4, h: 10 },
    { i: 'hourlyTrend', x: 0, y: 30, w: 4, h: 11 },
    { i: 'sessionTable', x: 0, y: 41, w: 4, h: 11 },
  ],
  xxs: [
    { i: 'activeUsers', x: 0, y: 0, w: 2, h: 10 },
    { i: 'riskUsers', x: 0, y: 10, w: 2, h: 10 },
    { i: 'alertFeed', x: 0, y: 20, w: 2, h: 10 },
    { i: 'hourlyTrend', x: 0, y: 30, w: 2, h: 12 },
    { i: 'sessionTable', x: 0, y: 42, w: 2, h: 13 },
  ],
}

const initialRiskUsers: RiskUser[] = [
  { name: '김민수', team: '운수팀 A', riskScore: 93, sessionsToday: 12 },
  { name: '마동석', team: '운수팀 C', riskScore: 95, sessionsToday: 8 },
  { name: '지석진', team: '업무팀 2', riskScore: 91, sessionsToday: 11 },
  { name: '김태리', team: '운수팀 B', riskScore: 88, sessionsToday: 10 },
  { name: '이소율', team: '운수팀 C', riskScore: 86, sessionsToday: 13 },
  { name: '이광수', team: '업무팀 2', riskScore: 82, sessionsToday: 15 },
  { name: '송혜교', team: '업무팀 1', riskScore: 77, sessionsToday: 9 },
  { name: '박연우', team: '운수팀 B', riskScore: 71, sessionsToday: 14 },
  { name: '정하준', team: '업무팀 1', riskScore: 68, sessionsToday: 10 },
  { name: '최지우', team: '운수팀 A', riskScore: 67, sessionsToday: 11 },
  { name: '한효주', team: '운수팀 B', riskScore: 54, sessionsToday: 12 },
  { name: '송중기', team: '업무팀 1', riskScore: 49, sessionsToday: 10 },
  { name: '김도현', team: '업무팀 2', riskScore: 45, sessionsToday: 11 },
  { name: '이준호', team: '운수팀 A', riskScore: 45, sessionsToday: 12 },
  { name: '유해진', team: '운수팀 C', riskScore: 41, sessionsToday: 13 },
  { name: '손예진', team: '업무팀 1', riskScore: 33, sessionsToday: 10 },
  { name: '공유', team: '운수팀 B', riskScore: 31, sessionsToday: 11 },
  { name: '정우성', team: '운수팀 B', riskScore: 22, sessionsToday: 12 },
  { name: '조진웅', team: '운수팀 C', riskScore: 19, sessionsToday: 10 },
  { name: '현빈', team: '업무팀 1', riskScore: 15, sessionsToday: 11 },
  { name: '박서준', team: '운수팀 A', riskScore: 12, sessionsToday: 12 },
  { name: '최은재', team: '업무팀 2', riskScore: 12, sessionsToday: 10 },
  { name: '강하늘', team: '운수팀 A', riskScore: 8, sessionsToday: 11 },
  { name: '김희애', team: '운수팀 C', riskScore: 5, sessionsToday: 12 },
  { name: '김종국', team: '업무팀 2', riskScore: 3, sessionsToday: 10 },
]

const alertItems: AlertItem[] = [
  { user: '김민수', team: '운수팀 A', level: 'L2', date: '2026-04-11', time: '22:31', note: '수면 상태 3.2초 지속' },
  { user: '김민수', team: '운수팀 A', level: 'L1', date: '2026-04-11', time: '21:15', note: '졸음 의심 현상 감지' },
  { user: '이소율', team: '운수팀 C', level: 'L2', date: '2026-04-11', time: '22:10', note: '경고 자동 종료 후 재발생' },
  { user: '마동석', team: '운수팀 C', level: 'L2', date: '2026-04-11', time: '20:45', note: '심각한 졸음 패턴 감지' },
  { user: '지석진', team: '업무팀 2', level: 'L2', date: '2026-04-11', time: '19:20', note: '눈 감김 시간 초과' },
  { user: '김태리', team: '운수팀 B', level: 'L1', date: '2026-04-11', time: '18:50', note: '반복적인 하품 감지' },
  { user: '박연우', team: '운수팀 B', level: 'L1', date: '2026-04-10', time: '22:24', note: '졸음 상태 반복 감지' },
  { user: '한효주', team: '운수팀 B', level: 'L1', date: '2026-04-10', time: '18:30', note: '시선 이탈 및 졸음 감지' },
  { user: '이광수', team: '업무팀 2', level: 'L2', date: '2026-04-10', time: '15:20', note: '장시간 눈 감김 감지' },
  { user: '송혜교', team: '업무팀 1', level: 'L2', date: '2026-04-09', time: '14:10', note: '수면 판정 알림 발송' },
  { user: '지석진', team: '업무팀 2', level: 'L2', date: '2026-04-08', time: '11:05', note: '반복적 졸음 발생' },
  { user: '김태리', team: '운수팀 B', level: 'L2', date: '2026-04-07', time: '23:40', note: '야간 운전 중 졸음 감지' },
  { user: '최지우', team: '운수팀 A', level: 'L1', date: '2026-04-06', time: '09:15', note: '졸음 주의 단계 진입' },
  { user: '정하준', team: '업무팀 1', level: 'L1', date: '2026-04-01', time: '21:58', note: '장시간 무반응' },
]

const sessionRows: SessionRow[] = [
  ...initialRiskUsers.flatMap(user => 
    Array.from({ length: 12 }).map((_, idx) => ({
      user: user.name,
      date: `2026-04-${String(11 - Math.floor(idx/3)).padStart(2, '0')}`,
      startTime: `${String(8 + (idx % 8) * 2).padStart(2, '0')}:15`,
      duration: `${1 + (idx % 3)}h ${10 + (idx * 5) % 45}m`,
      alerts: idx % 4 === 0 ? '졸음 2회 / 수면 1회' : idx % 7 === 0 ? '수면 1회' : '정상'
    }))
  )
]

const hourlyTrendData = [
  { label: '00', value: 5 }, { label: '02', value: 3 }, { label: '04', value: 8 }, { label: '06', value: 12 },
  { label: '08', value: 14 }, { label: '10', value: 18 }, { label: '12', value: 31 }, { label: '14', value: 24 },
  { label: '16', value: 39 }, { label: '18', value: 48 }, { label: '20', value: 42 }, { label: '22', value: 33 },
]

function readStoredLayouts(): ResponsiveLayouts {
  if (typeof window === 'undefined') return defaultLayouts
  const raw = window.localStorage.getItem(LAYOUTS_STORAGE_KEY)
  if (!raw) return defaultLayouts
  try {
    const parsed = JSON.parse(raw) as ResponsiveLayouts
    return parsed && Object.keys(parsed).length > 0 ? parsed : defaultLayouts
  } catch { return defaultLayouts }
}

function readStoredVisibleWidgets(): WidgetId[] {
  if (typeof window === 'undefined') return widgetOrder
  const raw = window.localStorage.getItem(VISIBLE_STORAGE_KEY)
  if (!raw) return widgetOrder
  try {
    const parsed = JSON.parse(raw) as WidgetId[]
    const valid = parsed.filter(id => widgetOrder.includes(id))
    return valid.length > 0 ? valid : widgetOrder
  } catch { return widgetOrder }
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [operatorCode, setOperatorCode] = useState('')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoginMode) { onLogin() }
    else {
      if (operatorCode !== 'ABC-123') { alert('유효하지 않은 운영자 코드입니다.'); return; }
      alert('회원가입이 완료되었습니다. 로그인해 주세요.'); setIsLoginMode(true); setPassword(''); setOperatorCode('')
    }
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: '#0f3d3e', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'white' }}><Lock size={32} /></div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0' }}>{isLoginMode ? '관리자 로그인' : '조직 관리자 회원가입'}</h1>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div><label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>이메일</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb' }} required /></div>
          <div><label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>비밀번호</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb' }} required /></div>
          {!isLoginMode && (<div><label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>운영자 코드</label><input type="text" value={operatorCode} onChange={e => setOperatorCode(e.target.value)} placeholder="ABC-123" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb' }} required /></div>)}
          <button type="submit" className="ghost-button" style={{ width: '100%', background: '#0f3d3e', color: 'white', fontWeight: 600, height: '3.5rem', marginTop: '12px' }}>{isLoginMode ? '로그인' : '회원가입'}</button>
        </form>
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280' }}>
          {isLoginMode ? (<>계정이 없으신가요? <a href="#" onClick={e => { e.preventDefault(); setIsLoginMode(false); }} style={{ color: '#0f3d3e', fontWeight: 600 }}>회원가입</a></>) : (<>이미 계정이 있으신가요? <a href="#" onClick={e => { e.preventDefault(); setIsLoginMode(true); }} style={{ color: '#0f3d3e', fontWeight: 600 }}>로그인</a></>)}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [editMode, setEditMode] = useState(false)
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(readStoredLayouts)
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetId[]>(readStoredVisibleWidgets)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<string | null>(null)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [riskUsers, setRiskUsers] = useState<RiskUser[]>(initialRiskUsers)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [statType, setStatType] = useState<'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('hourly')
  const [statStartDate, setStatStartDate] = useState('2026-04-04')
  const [statEndDate, setStatEndDate] = useState('2026-04-11')
  
  const getWeekStr = (dateStr: string) => {
    const date = new Date(dateStr); const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())); const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return `${d.getUTCFullYear()}-W${String(Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)).padStart(2, '0')}`
  }
  const getWeekOfMonthStr = (dateStr: string) => {
    const date = new Date(dateStr); const year = date.getFullYear(); const month = date.getMonth() + 1; const day = date.getDate(); const firstDay = new Date(year, date.getMonth(), 1).getDay()
    return `${year}-${month}월 ${Math.ceil((day + (firstDay === 0 ? 6 : firstDay - 1)) / 7)}주차`
  }
  
  const [alertFilterStartDate, setAlertFilterStartDate] = useState('2026-04-04'); const [alertFilterEndDate, setAlertFilterEndDate] = useState('2026-04-11'); const [alertFilterLevel, setAlertFilterLevel] = useState<'all' | 'L1' | 'L2'>('all'); const [selectedStatGroup, setSelectedStatGroup] = useState<{ key: string, items: AlertItem[] } | null>(null)
  
  useEffect(() => { window.localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(layouts)) }, [layouts])
  useEffect(() => { window.localStorage.setItem(VISIBLE_STORAGE_KEY, JSON.stringify(visibleWidgets)) }, [visibleWidgets])
  
  const hiddenCount = widgetOrder.length - visibleWidgets.length
  
  function handleLayoutChange(_currentLayout: Layout, allLayouts: ResponsiveLayouts) {
    setLayouts((prevLayouts) => {
      const updatedLayouts = { ...prevLayouts }
      Object.keys(allLayouts).forEach((breakpoint) => {
        const bp = breakpoint as keyof ResponsiveLayouts; const newBpLayout = allLayouts[bp] || []; const prevBpLayout = prevLayouts[bp] || []; const merged = [...prevBpLayout]
        newBpLayout.forEach((newItem) => {
          const index = merged.findIndex((item) => item.i === newItem.i); let finalItem = { ...newItem }
          if (newItem.w === 1 && newItem.h === 1) { const defaultItem = defaultLayouts[bp]?.find((item) => item.i === newItem.i); if (defaultItem) { finalItem = { ...newItem, w: defaultItem.w, h: defaultItem.h, minW: defaultItem.w, minH: defaultItem.h } } }
          if (index > -1) { const prevItem = merged[index]; if (!(newItem.w === 1 && newItem.h === 1 && (prevItem.w > 1 || prevItem.h > 1))) { merged[index] = finalItem } } else { merged.push(finalItem) }
        }); updatedLayouts[bp] = merged
      }); return updatedLayouts
    })
  }
  
  function toggleWidget(widgetId: WidgetId) {
    setVisibleWidgets((currentWidgets) => {
      if (!currentWidgets.includes(widgetId)) {
        setLayouts((prevLayouts) => {
          const updated = { ...prevLayouts }; Object.keys(defaultLayouts).forEach((breakpoint) => {
            const bp = breakpoint as keyof ResponsiveLayouts
            if (!(updated[bp] || []).some(item => item.i === widgetId)) { const defaultItem = defaultLayouts[bp]?.find(item => item.i === widgetId); if (defaultItem) { updated[bp] = [...(updated[bp] || []), defaultItem] } }
          }); return updated
        }); return [...currentWidgets, widgetId]
      }
      if (currentWidgets.length === 1) return currentWidgets; return currentWidgets.filter(id => id !== widgetId)
    })
  }
  
  function resetBoard() { setLayouts(defaultLayouts); setVisibleWidgets(widgetOrder); window.localStorage.removeItem(LAYOUTS_STORAGE_KEY); window.localStorage.removeItem(VISIBLE_STORAGE_KEY) }
  
  if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />
  
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__badge"><ShieldAlert size={18} /></div>
          <div><strong>Eye:on Admin</strong></div>
        </div>
        <nav className="sidebar__nav">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={`sidebar__nav-item${activeTab === id ? ' is-active' : ''}`} onClick={() => setActiveTab(id)}>
              <Icon size={18} /><span>{label}</span><ChevronRight size={14} />
            </button>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <button type="button" className={`sidebar__nav-item${activeTab === 'account' ? ' is-active' : ''}`} onClick={() => setActiveTab('account')}>
              <UserCircle size={18} /><span>계정</span><ChevronRight size={14} />
            </button>
          </div>
        </nav>
      </aside>
      
      <main className="workspace">
        {activeTab === 'dashboard' && (
          <>
            <header className="topbar">
              <div className="topbar__copy">
                <h1>통합 관제 대시보드</h1>
              </div>
              <div className="topbar__controls"><button type="button" className={`ghost-button${editMode ? ' is-active' : ''}`} onClick={() => setEditMode(!editMode)}><SquarePen size={16} />{editMode ? '편집 종료' : '편집 모드'}</button><button type="button" className="ghost-button" onClick={resetBoard}><RotateCcw size={16} />레이아웃 초기화</button></div>
            </header>
            <section className="hero-strip">
              <SummaryCard icon={Wifi} label="현재 활성 사용자" value={riskUsers.length.toString()} detail="전체 등록 인원 기준" />
              <SummaryCard icon={ShieldAlert} label="오늘 위험 사용자" value={riskUsers.filter(u => u.riskScore > 70).length.toString()} detail="누적 위험도 70점 이상" />
              <SummaryCard icon={BellRing} label="금일 경고 알림" value={alertItems.filter(a => a.date === '2026-04-11').length.toString()} detail={`졸음 ${alertItems.filter(a => a.date === '2026-04-11' && a.level === 'L1').length}건 / 수면 ${alertItems.filter(a => a.date === '2026-04-11' && a.level === 'L2').length}건`} />
            </section>
            <section className="board-section">
              <div className="board-section__header"><div><h2>전체 조직</h2></div><div className="board-section__meta"><span>{editMode ? '위젯 이동/크기 변경 가능' : '읽기 모드'}</span><span>{hiddenCount > 0 ? `숨김 ${hiddenCount}개` : '전체 표시 중'}</span></div></div>
              {editMode && (<section className="widget-library">{widgetOrder.map((id) => (<button key={id} type="button" className={`widget-library__chip${visibleWidgets.includes(id) ? ' is-on' : ''}`} onClick={() => toggleWidget(id)}><span>{widgetMeta[id].title}</span><small>{visibleWidgets.includes(id) ? '표시 중' : '숨김'}</small></button>))}</section>)}
              <ResponsiveGridLayout className={`workspace-board${editMode ? ' is-editing' : ''}`} layouts={layouts} breakpoints={{ lg: 1000, md: 800, sm: 640, xs: 480, xxs: 0 }} cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }} rowHeight={40} margin={[16, 16]} containerPadding={[0, 0]} draggableHandle=".widget-shell__header" isDraggable={editMode} isResizable={editMode} onLayoutChange={handleLayoutChange}>
                {visibleWidgets.map((id) => (<div key={id} data-grid={defaultLayouts.lg?.find(l => l.i === id)}><WidgetShell meta={widgetMeta[id]} editMode={editMode}>{renderWidget(id, setActiveTab, (name) => { setActiveTab('members'); setSelectedUserForDetail(name); }, riskUsers)}</WidgetShell></div>))}
              </ResponsiveGridLayout>
            </section>
          </>
        )}
        
        {activeTab === 'members' && (
          <>
            <header className="topbar">
              <div className="topbar__copy">
                <h1>구성원 관리 시스템</h1>
              </div>
            </header>
            <section className="board-section">
              <div className="board-section__header"><div><h2>전체 조직 구성원 목록</h2></div>
                <div className="search-strip" style={{ marginBottom: 0 }}>
                  <div className="search-strip__input"><Search size={16} /><input type="text" placeholder="이름 또는 부서 검색" value={memberSearchQuery} onChange={e => setMemberSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit', width: '100%' }} /></div>
                  <button type="button" className="ghost-button" style={{ background: '#0f3d3e', color: 'white', fontWeight: 600 }} onClick={() => setIsAddMemberModalOpen(true)}>구성원 추가</button>
                </div>
              </div>
              <div className="table-shell">
                <table>
                  <thead><tr><th>사용자</th><th>소속</th><th>금일 세션 수</th><th>최근 위험도 점수</th><th>관리</th></tr></thead>
                  <tbody>
                    {riskUsers.filter(u => u.name.includes(memberSearchQuery) || u.team.includes(memberSearchQuery)).map((user) => (
                      <tr key={user.name}>
                        <td><strong>{user.name}</strong></td><td>{user.team}</td><td>{user.sessionsToday}회</td>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ minWidth: '30px' }}>{user.riskScore}</span><div style={{ flex: 1, height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: `${user.riskScore}%`, height: '100%', background: user.riskScore > 80 ? '#ef4444' : user.riskScore > 60 ? '#f59e0b' : '#10b981' }} /></div></div></td>
                        <td><button type="button" className="ghost-button" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setSelectedUserForDetail(user.name)}>상세 정보</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
        
        {activeTab === 'alerts' && (() => {
          const filtered = alertItems.filter(item => {
            const time = new Date(item.date).getTime(); const start = new Date(alertFilterStartDate).getTime(); const end = new Date(alertFilterEndDate).getTime()
            if (time < start || time > end) return false; if (alertFilterLevel !== 'all' && item.level !== alertFilterLevel) return false; return true
          })
          const handleExport = () => {
            const headers = ['날짜', '발생 시간', '사용자', '소속', '알림 단계', '상세 내용']; const rows = filtered.map(a => [a.date, a.time, a.user, a.team, a.level, a.note])
            const csv = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
            const link = document.createElement("a"); link.href = url; link.download = `alerts_${alertFilterStartDate}.csv`; link.click()
          }
          return (
            <>
              <header className="topbar">
                <div className="topbar__copy">
                  <h1>졸음 및 위험 감지 로그</h1>
                </div>
              </header>
              <section className="board-section">
                <div className="board-section__header"><div><h2>전체 조직 알림 로그</h2></div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="ghost-button" onClick={() => { setAlertFilterStartDate('2026-04-11'); setAlertFilterEndDate('2026-04-11'); }}>오늘</button>
                    <button type="button" className="ghost-button" onClick={() => { setAlertFilterStartDate('2026-04-04'); setAlertFilterEndDate('2026-04-11'); }}>최근 7일</button>
                    <button type="button" className="ghost-button" onClick={() => { setAlertFilterStartDate('2026-04-01'); setAlertFilterEndDate('2026-04-30'); }}>이번 달</button>
                    <button type="button" className="ghost-button" onClick={() => { setAlertFilterStartDate('2026-01-01'); setAlertFilterEndDate('2026-12-31'); }}>올해</button>
                  </div>
                </div>
                <div className="search-strip" style={{ padding: '12px 0', gap: '16px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label style={{ fontSize: '0.9rem', fontWeight: 500 }}>조회 기간:</label><input type="date" value={alertFilterStartDate} onChange={e => setAlertFilterStartDate(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }} /><span>~</span><input type="date" value={alertFilterEndDate} onChange={e => setAlertFilterEndDate(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }} /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label style={{ fontSize: '0.9rem', fontWeight: 500 }}>단계:</label><select value={alertFilterLevel} onChange={e => setAlertFilterLevel(e.target.value as any)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}><option value="all">모든 단계</option><option value="L1">졸음</option><option value="L2">수면</option></select></div>
                  <button type="button" className="ghost-button" style={{ marginLeft: 'auto', background: '#eee', color: '#000', fontWeight: 600 }} onClick={handleExport}>내보내기 (CSV)</button>
                </div>
                <div className="table-shell"><table><thead><tr><th>날짜</th><th>발생 시간</th><th>사용자</th><th>소속</th><th>알림 단계</th><th>상세 내용</th></tr></thead><tbody>{filtered.length > 0 ? filtered.map((item, i) => (<tr key={i}><td>{item.date}</td><td>{item.time}</td><td><strong>{item.user}</strong></td><td>{item.team}</td><td><span className={`feed-row__level feed-row__level--${item.level}`}>{item.level === 'L1' ? '졸음' : item.level === 'L2' ? '수면' : item.level}</span></td><td>{item.note}</td></tr>)) : <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>해당 조건에 맞는 알림이 없습니다.</td></tr>}</tbody></table></div>
              </section>
            </>
          )
        })()}
        
        {activeTab === 'statistics' && (() => {
          const filtered = alertItems.filter(item => {
            if (statType === 'hourly' || statType === 'daily') { const t = new Date(item.date).getTime(); return !(t < new Date(statStartDate).getTime() || t > new Date(statEndDate).getTime()) }
            else if (statType === 'weekly') { const w = getWeekStr(item.date); return w >= statStartDate && w <= statEndDate }
            else if (statType === 'monthly') { const m = item.date.substring(0, 7); return m >= statStartDate.substring(0, 7) && m <= statEndDate.substring(0, 7) }
            else if (statType === 'yearly') { const y = item.date.substring(0, 4); return y >= statStartDate.substring(0, 4) && y <= statEndDate.substring(0, 4) }
            return true
          })
          const grouped = filtered.reduce((acc, item) => {
            let key = ''
            if (statType === 'hourly') { const h = parseInt(item.time.split(':')[0]); key = `${item.date} ${String(h).padStart(2, '0')}:00 ~ ${String(h + 1).padStart(2, '0')}:00` }
            else if (statType === 'daily') { key = item.date }
            else if (statType === 'weekly') { key = getWeekOfMonthStr(item.date) }
            else if (statType === 'monthly') { key = `${item.date.substring(0, 4)}-${item.date.substring(5, 7)}월` }
            else if (statType === 'yearly') { key = `${item.date.substring(0, 4)}년` }
            if (!acc[key]) acc[key] = { key, total: 0, l1: 0, l2: 0, items: [] }
            acc[key].total++; if (item.level === 'L1') acc[key].l1++; if (item.level === 'L2') acc[key].l2++; acc[key].items.push(item); return acc
          }, {} as Record<string, any>)
          const statResult = Object.values(grouped).sort((a: any, b: any) => b.key.localeCompare(a.key)); const statMax = Math.max(...statResult.map((r: any) => r.total), 1)
          return (
            <>
              <header className="topbar">
                <div className="topbar__copy">
                  <h1>졸음 발생 패턴 및 통계 분석</h1>
                </div>
              </header>
              <section className="board-section">
                <div className="board-section__header"><div><h2>상세 통계 데이터</h2></div>
                  <div className="search-strip" style={{ background: 'none', border: 'none', padding: 0 }}>
                    <button type="button" className={`ghost-button${statType === 'hourly' ? ' is-active' : ''}`} onClick={() => { setStatType('hourly'); setStatStartDate('2026-04-04'); setStatEndDate('2026-04-11'); }}>시간대</button>
                    <button type="button" className={`ghost-button${statType === 'daily' ? ' is-active' : ''}`} onClick={() => { setStatType('daily'); setStatStartDate('2026-04-04'); setStatEndDate('2026-04-11'); }}>일</button>
                    <button type="button" className={`ghost-button${statType === 'weekly' ? ' is-active' : ''}`} onClick={() => { setStatType('weekly'); setStatStartDate('2026-W10'); setStatEndDate('2026-W15'); }}>주</button>
                    <button type="button" className={`ghost-button${statType === 'monthly' ? ' is-active' : ''}`} onClick={() => { setStatType('monthly'); setStatStartDate('2026-01-01'); setStatEndDate('2026-12-31'); }}>월</button>
                    <button type="button" className={`ghost-button${statType === 'yearly' ? ' is-active' : ''}`} onClick={() => { setStatType('yearly'); setStatStartDate('2024-01-01'); setStatEndDate('2026-12-31'); }}>년</button>
                  </div>
                </div>
                <div className="widget-stack" style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}><label style={{ fontSize: '0.9rem', fontWeight: 500 }}>조회 기간:</label>
                    {(() => {
                      const style = { padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }
                      if (statType === 'hourly' || statType === 'daily') return <><input type="date" value={statStartDate} onChange={e => setStatStartDate(e.target.value)} style={style} /><span>~</span><input type="date" value={statEndDate} onChange={e => setStatEndDate(e.target.value)} style={style} /></>
                      if (statType === 'weekly') return <><input type="week" value={statStartDate.includes('W') ? statStartDate : getWeekStr(statStartDate)} onChange={e => setStatStartDate(e.target.value)} style={style} /><span>~</span><input type="week" value={statEndDate.includes('W') ? statEndDate : getWeekStr(statEndDate)} style={style} /></>
                      if (statType === 'monthly') return <><input type="month" value={statStartDate.substring(0, 7)} onChange={e => setStatStartDate(e.target.value + '-01')} style={style} /><span>~</span><input type="month" value={statEndDate.substring(0, 7)} onChange={e => setStatEndDate(e.target.value + '-01')} style={style} /></>
                      return <><select value={statStartDate.substring(0, 4)} onChange={e => setStatStartDate(e.target.value + '-01-01')} style={style}>{['2024','2025','2026'].map(y => <option key={y} value={y}>{y}년</option>)}</select><span>~</span><select value={statEndDate.substring(0, 4)} onChange={e => setStatEndDate(e.target.value + '-01-01')} style={style}>{['2024','2025','2026'].map(y => <option key={y} value={y}>{y}년</option>)}</select></>
                    })()}
                    <button type="button" className="ghost-button" style={{ background: '#eee', color: '#000', fontWeight: 600 }}>적용</button>
                    <button type="button" className="ghost-button" onClick={() => { setStatType('hourly'); setStatStartDate('2026-04-04'); setStatEndDate('2026-04-11'); }}>초기화</button>
                  </div>
                  {statResult.length > 0 ? (<div className="table-shell"><table><thead><tr><th>기준</th><th>총 알림 수</th><th>졸음</th><th>수면</th><th>발생 비율</th><th>관리</th></tr></thead><tbody>{statResult.map((row: any) => { const p = Math.round((row.total / statMax) * 100); return <tr key={row.key}><td>{row.key}</td><td><strong>{row.total}건</strong></td><td>{row.l1}건</td><td>{row.l2}건</td><td><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ minWidth: '40px' }}>{p}%</span><div style={{ flex: 1, height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: `${p}%`, height: '100%', background: p > 50 ? '#ef4444' : '#f59e0b' }} /></div></div></td><td><button type="button" className="ghost-button" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setSelectedStatGroup({ key: row.key, items: row.items })}>알림 확인</button></td></tr> })}</tbody></table></div>) : <div style={{ padding: '32px', textAlign: 'center', background: '#f9fafb', color: '#6b7280' }}>조건에 맞는 데이터가 없습니다.</div>}
                </div>
              </section>
            </>
          )
        })()}
        
        {activeTab === 'account' && (
          <>
            <header className="topbar">
              <div className="topbar__copy">
                <h1>계정 설정</h1>
              </div>
            </header>
            <section className="board-section">
              <div className="board-section__header"><div><h2>계정 보안 및 접근 제어</h2></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '16px' }}>
                <div className="widget-stack" style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>비밀번호 변경</h3>
                  <form onSubmit={e => { e.preventDefault(); alert('비밀번호가 변경되었습니다.'); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div><label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>변경할 비밀번호</label><input type="password" placeholder="새 비밀번호" style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }} required /></div>
                    <div><label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>비밀번호 확인</label><input type="password" placeholder="비밀번호 재입력" style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }} required /></div>
                    <div><label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>조직 코드</label><input type="text" placeholder="ABC-123" style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }} required /></div>
                    <button type="submit" className="ghost-button" style={{ background: '#0f3d3e', color: 'white', fontWeight: 600, height: '3rem' }}>변경 저장</button>
                  </form>
                </div>

                <div className="widget-stack" style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', height: 'fit-content' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: '#d95d39' }}>시스템 로그아웃</h3>
                  <button type="button" className="ghost-button" onClick={() => setIsLoggedIn(false)} style={{ color: '#d95d39', border: '1px solid #d95d39', fontWeight: 600, height: '3rem', width: '100%', justifyContent: 'center' }}>
                    <LogOut size={18} style={{ marginRight: '8px' }} /> 로그아웃
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      
      {selectedUserForDetail && <UserDetailModal userName={selectedUserForDetail} riskUsers={riskUsers} onClose={() => setSelectedUserForDetail(null)} onDelete={() => { setRiskUsers(prev => prev.filter(u => u.name !== selectedUserForDetail)); setSelectedUserForDetail(null); }} onUpdate={(newTeam) => { setRiskUsers(prev => prev.map(u => u.name === selectedUserForDetail ? { ...u, team: newTeam } : u)); }} />}
      {selectedStatGroup && <StatEventModal groupKey={selectedStatGroup.key} items={selectedStatGroup.items} onClose={() => setSelectedStatGroup(null)} />}
      {isAddMemberModalOpen && <AddMemberModal onAdd={(email, team) => setRiskUsers(prev => [...prev, { name: email.split('@')[0], team, riskScore: 0, sessionsToday: 0 }])} onClose={() => setIsAddMemberModalOpen(false)} />}
    </div>
  )
}

function renderWidget(id: WidgetId, setActiveTab: (tab: string) => void, onShow: (name: string) => void, riskUsers: RiskUser[]) {
  switch (id) {
    case 'activeUsers': return <ActiveUsersWidget riskUsers={riskUsers} />
    case 'riskUsers': return <RiskUsersWidget onShowUserDetail={onShow} riskUsers={riskUsers} />
    case 'alertFeed': return <AlertFeedWidget setActiveTab={setActiveTab} />
    case 'hourlyTrend': return <HourlyTrendWidget />
    case 'sessionTable': return <SessionTableWidget />
    default: return null
  }
}

function SummaryCard({ icon: Icon, label, value, detail }: { icon: LucideIcon, label: string, value: string, detail: string }) {
  return (<article className="summary-card"><div className="summary-card__icon"><Icon size={24} /></div><div><p className="summary-card__label">{label}</p><strong className="summary-card__value">{value}</strong><p className="summary-card__detail">{detail}</p></div></article>)
}

function WidgetShell({ meta, editMode, children }: { meta: WidgetMeta, editMode: boolean, children: ReactNode }) {
  if (!meta) return null
  return (<section className="widget-shell"><header className="widget-shell__header" style={{ cursor: editMode ? 'grab' : 'default' }}><div><h3>{meta.title}</h3></div>{editMode && <div className="widget-shell__edit-pill"><Move size={14} />이동</div>}</header><div className="widget-shell__body">{children}</div></section>)
}

function ActiveUsersWidget({ riskUsers }: { riskUsers: RiskUser[] }) {
  const highRisk = riskUsers.filter(u => u.riskScore > 80).length
  const caution = riskUsers.filter(u => u.riskScore > 50 && u.riskScore <= 80).length
  const normal = riskUsers.length - highRisk - caution
  return (<div className="widget-stack"><div className="hero-stat"><div><p className="hero-stat__label">조직 전체 등록 인원</p><strong className="hero-stat__value">{riskUsers.length}</strong></div><div className="hero-stat__badge">+2 from 1h ago</div></div>
    <div className="metric-grid"><MetricItem label="정상" value={normal.toString()} tone="emerald" /><MetricItem label="졸음" value={caution.toString()} tone="sand" /><MetricItem label="수면" value={highRisk.toString()} tone="blue" /></div>
    <div className="mini-panel"><div className="mini-panel__row"><span>오늘 신규 가입</span><strong>+18</strong></div><div className="mini-panel__row"><span>실시간 경고</span><strong>2</strong></div></div></div>)
}

function MetricItem({ label, value, tone }: { label: string, value: string, tone: 'blue' | 'sand' | 'emerald' }) { return (<div className={`metric-item metric-item--${tone}`}><span>{label}</span><strong>{value}</strong></div>) }

function RiskUsersWidget({ onShowUserDetail, riskUsers }: { onShowUserDetail?: (name: string) => void, riskUsers: RiskUser[] }) {
  const sorted = [...riskUsers].sort((a, b) => b.riskScore - a.riskScore)
  return (<div className="widget-stack">{sorted.map(user => (<article key={user.name} className="risk-row"><div className="risk-row__copy"><div><strong>{user.name}</strong><span>{user.team}</span></div><span className="risk-row__sessions">{user.sessionsToday}세션</span></div><div className="risk-row__bar"><div style={{ width: `${user.riskScore}%`, background: user.riskScore > 80 ? '#ef4444' : user.riskScore > 60 ? '#f59e0b' : '#10b981' }} /></div><div className="risk-row__footer"><span>위험도 {user.riskScore}</span><button type="button" onClick={() => onShowUserDetail?.(user.name)}>상세 보기</button></div></article>))}</div>)
}

function AlertFeedWidget({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'L1' | 'L2'>('all'); const filtered = alertItems.filter(i => filter === 'all' ? true : i.level === filter)
  return (<div className="widget-stack" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', padding: '0 16px' }}>{(['all', 'L1', 'L2'] as const).map(l => <button key={l} type="button" className={`ghost-button${filter === l ? ' is-active' : ''}`} style={{ flex: 1, padding: '6px' }} onClick={() => setFilter(l)}>{l === 'all' ? '전체' : (l === 'L1' ? '졸음' : '수면')}</button>)}</div>
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px 16px 16px' }}>
      {filtered.length > 0 ? filtered.map((item, index) => (
        <article key={index} className="feed-row" style={{ margin: 0 }}><div className="feed-row__head"><div><strong>{item.user}</strong><span>{item.team}</span></div><span className={`feed-row__level feed-row__level--${item.level}`}>{item.level === 'L1' ? '졸음' : item.level === 'L2' ? '수면' : item.level}</span></div><p className="feed-row__note">{item.note}</p><div className="feed-row__meta"><span>{item.time}</span><button type="button" onClick={() => setActiveTab?.('alerts')}>알림 열기</button></div></article>
      )) : <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>해당 등급의 알림이 없습니다.</div>}
    </div></div>)
}

function HourlyTrendWidget() {
  const total = alertItems.length; const l1 = alertItems.filter(a => a.level === 'L1').length; const l2 = alertItems.filter(a => a.level === 'L2').length
  return (<div className="widget-stack"><div className="chart-header"><div><span>금일 피크 시간</span><strong>22:00</strong></div><div><span>총 누적 알림</span><strong>{total}건</strong></div></div>
    <div className="bar-chart" aria-label="시간대별 졸음 알림 차트">{hourlyTrendData.map(p => (<div key={p.label} className="bar-chart__item"><div className="bar-chart__column"><div style={{ height: `${p.value * 3}px` }} /></div><strong>{p.value}</strong><span>{p.label}</span></div>))}</div>
    <div className="compare-strip"><div><span>졸음 발생</span><strong>{Math.round(l1/total*100)}%</strong></div><div><span>수면 발생</span><strong>{Math.round(l2/total*100)}%</strong></div><div><span>기타 알림</span><strong>0%</strong></div></div></div>)
}

function SessionTableWidget() {
  const [query, setQuery] = useState('')
  const filtered = sessionRows.filter(row => row.user.toLowerCase().includes(query.toLowerCase()) || row.alerts.toLowerCase().includes(query.toLowerCase()))
  return (<div className="widget-stack">
    <div className="search-strip">
      <div className="search-strip__input"><Search size={16} /><input type="text" placeholder="사용자 또는 알림 검색" value={query} onChange={e => setQuery(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit', width: '100%' }} /></div>
    </div>
    <div className="table-shell"><table><thead><tr><th>사용자</th><th>러닝 타임</th><th>알림 요약</th></tr></thead><tbody>{filtered.length > 0 ? filtered.map((row, idx) => (<tr key={idx}><td>{row.user}</td><td>{row.duration}</td><td>{row.alerts}</td></tr>)) : <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>검색 결과가 없습니다.</td></tr>}</tbody></table></div></div>)
}

function StatEventModal({ groupKey, items, onClose }: { groupKey: string, items: AlertItem[], onClose: () => void }) {
  return (<div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}><div className="modal-content" style={{ background: 'white', width: '100%', maxWidth: '800px', maxHeight: '90vh', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><header style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><h2 style={{ margin: '0', fontSize: '1.25rem' }}>{groupKey} <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'normal', marginLeft: '8px' }}>발생 알림 목록</span></h2></div><button type="button" className="ghost-button" onClick={onClose} style={{ padding: '8px' }}>닫기</button></header><div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}><div className="table-shell"><table style={{ margin: 0 }}><thead><tr><th>발생 시간</th><th>사용자</th><th>소속</th><th>알림 단계</th><th>상세 내용</th></tr></thead><tbody>{items.map((item, i) => (<tr key={i}><td>{item.time}</td><td><strong>{item.user}</strong></td><td>{item.team}</td><td><span className={`feed-row__level feed-row__level--${item.level}`}>{item.level === 'L1' ? '졸음' : item.level === 'L2' ? '수면' : item.level}</span></td><td>{item.note}</td></tr>))}</tbody></table></div></div></div></div>)
}

function UserDetailModal({ userName, riskUsers, onClose, onDelete, onUpdate }: { userName: string, riskUsers: RiskUser[], onClose: () => void, onDelete: () => void, onUpdate: (team: string) => void }) {
  const [filterDays, setFilterDays] = useState<number | null>(7); const [editMode, setEditMode] = useState(false); const user = riskUsers.find(u => u.name === userName) || { name: userName, team: '미상', riskScore: 0, sessionsToday: 0 }
  const [newTeam, setNewTeam] = useState(user.team)
  const filterByDate = (date: string) => { if (!filterDays) return true; return (new Date('2026-04-11').getTime() - new Date(date).getTime()) / 86400000 <= filterDays }
  const alerts = alertItems.filter(a => a.user === userName && filterByDate(a.date)); const sessions = sessionRows.filter(s => s.user === userName && filterByDate(s.date))
  return (<div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}><div className="modal-content" style={{ background: 'white', width: '100%', maxWidth: '800px', maxHeight: '90vh', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><header style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      {editMode ? (<div style={{ display: 'flex', gap: '8px' }}><strong style={{ alignSelf: 'center' }}>{user.name}</strong><input value={newTeam} onChange={e => setNewTeam(e.target.value)} placeholder="신규 소속" style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #e5e7eb' }} /></div>) 
      : (<h2 style={{ margin: '0', fontSize: '1.25rem' }}>{user.name} <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'normal', marginLeft: '8px' }}>{user.team}</span></h2>)}
    </div>
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {editMode ? (<><button type="button" className="ghost-button" onClick={() => { onUpdate(newTeam); setEditMode(false); }} style={{ padding: '8px', color: '#0f3d3e', fontWeight: 600 }}>저장</button><button type="button" className="ghost-button" onClick={() => setEditMode(false)} style={{ padding: '8px' }}>취소</button></>)
      : (<button type="button" className="ghost-button" onClick={() => setEditMode(true)} style={{ padding: '8px' }}>소속 수정</button>)}
      <button type="button" className="ghost-button" onClick={() => { if (window.confirm(`${userName} 구성원을 삭제하시겠습니까?`)) onDelete(); }} style={{ padding: '8px', color: '#d95d39', border: '1px solid #d95d39' }}>삭제</button>
      <select value={filterDays || 'all'} onChange={e => setFilterDays(e.target.value === 'all' ? null : Number(e.target.value))} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}><option value="7">최근 7일</option><option value="30">최근 30일</option><option value="all">전체 기간</option></select><button type="button" className="ghost-button" onClick={onClose} style={{ padding: '8px' }}>닫기</button>
    </div></header><div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <section><h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={18} />졸음 알림 로그 ({alerts.length}건)</h3>{alerts.length > 0 ? <div className="table-shell"><table style={{ margin: 0 }}><thead><tr><th>날짜</th><th>발생 시간</th><th>알림 단계</th><th>상세 내용</th></tr></thead><tbody>{alerts.map((a, i) => (<tr key={i}><td>{a.date}</td><td>{a.time}</td><td><span className={`feed-row__level feed-row__level--${a.level}`}>{a.level === 'L1' ? '졸음' : a.level === 'L2' ? '수면' : a.level}</span></td><td>{a.note}</td></tr>))}</tbody></table></div> : <div style={{ padding: '24px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: '#6b7280' }}>발생한 알림이 없습니다.</div>}</section>
    <section><h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock3 size={18} />세션 로그 ({sessions.length}건)</h3>{sessions.length > 0 ? <div className="table-shell"><table style={{ margin: 0 }}><thead><tr><th>날짜</th><th>시작 시간</th><th>러닝 타임</th><th>알림 요약</th></tr></thead><tbody>{sessions.map((s, i) => (<tr key={i}><td>{s.date}</td><td>{s.startTime}</td><td>{s.duration}</td><td>{s.alerts || '-'}</td></tr>))}</tbody></table></div> : <div style={{ padding: '24px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: '#6b7280' }}>기록된 세션이 없습니다.</div>}</section>
  </div></div></div>)
}

function AddMemberModal({ onClose, onAdd }: { onClose: () => void, onAdd: (email: string, team: string) => void }) {
  const [team, setTeam] = useState(''); const [email, setEmail] = useState('')
  return (<div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}><div className="modal-content" style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '12px', overflow: 'hidden' }}><header style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2>구성원 직접 추가</h2><button type="button" className="ghost-button" onClick={onClose} style={{ padding: '8px' }}>닫기</button></header><div style={{ padding: '24px' }}><p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#6b7280' }}>이메일로 구성원을 등록합니다. 이름은 사용자가 앱 가입 시 설정한 정보로 자동 연동됩니다.</p><form onSubmit={e => { e.preventDefault(); onAdd(email, team); alert(`${email} 구성원이 추가되었습니다.`); onClose(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div><label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>이메일</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }} required /></div>
    <div><label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>소속 부서</label><input type="text" value={team} onChange={e => setTeam(e.target.value)} placeholder="운수팀 A" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }} required /></div>
    <button type="submit" className="ghost-button" style={{ background: '#0f3d3e', color: 'white', fontWeight: 600, height: '3rem' }}>추가 저장</button></form></div></div></div>)
}

export default App
