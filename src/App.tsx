import { useEffect, useState } from 'react'
import {
  Activity,
  BellRing,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Lock,
  LogOut,
  Move,
  RotateCcw,
  Search,
  ShieldAlert,
  SquarePen,
  UserCircle,
} from 'lucide-react'
import {
  Responsive,
  WidthProvider,
  type ResponsiveLayouts
} from 'react-grid-layout/legacy'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './index.css'

import {
  navigationItems,
  widgetOrder,
  widgetMeta,
  defaultLayouts,
  initialRiskUsers,
  alertItems,
  sessionRows,
  hourlyTrendData,
  todayStr,
  weekAgoStr
} from './data/mockData'
import type { RiskUser, AlertItem, SessionRow, WidgetId } from './types'

const ResponsiveGridLayout = WidthProvider(Responsive)

const LAYOUTS_STORAGE_KEY = 'eyeon-admin-layouts'
const VISIBLE_STORAGE_KEY = 'eyeon-admin-visible-widgets'

function SummaryCard({ icon: Icon, label, value, detail }: { icon: any, label: string, value: string, detail: string }) {
  return (
    <div className="flex gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
      <div className="grid w-12 h-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={20} />
      </div>
      <div>
        <p className="m-0 text-sm font-bold text-slate-500">{label}</p>
        <strong className="block my-1 text-2xl font-black leading-none text-slate-900">{value}</strong>
        <p className="m-0 text-xs text-slate-400">{detail}</p>
      </div>
    </div>
  )
}

function UserDetailModal({ userName, riskUsers, alertItems, sessionRows, onClose, onDelete, onUpdate }: { userName: string, riskUsers: RiskUser[], alertItems: AlertItem[], sessionRows: SessionRow[], onClose: () => void, onDelete: () => void, onUpdate: (team: string) => void }) {
  const [filterDays, setFilterDays] = useState<number | null>(7)
  const [editMode, setEditMode] = useState(false)
  const user = riskUsers.find(u => u.name === userName) || { name: userName, team: 'UNKNOWN', alertCount: 0, sessionsToday: 0 }
  const [newTeam, setNewTeam] = useState(user.team)

  const filterByDate = (date: string) => { 
    if (!filterDays) return true; 
    return (new Date(todayStr).getTime() - new Date(date).getTime()) / 86400000 <= filterDays 
  }
  
  const alerts = alertItems.filter(a => a.user === userName && filterByDate(a.date))
  const sessions = sessionRows.filter(s => s.user === userName && filterByDate(s.date))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <header className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="grid w-12 h-12 place-items-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xl">
              {userName[0]}
            </div>
            <div>
              <h2 className="m-0 text-xl font-bold text-slate-900">{userName}</h2>
              {editMode ? (
                <div className="flex items-center gap-2 mt-1">
                  <input type="text" value={newTeam} onChange={e => setNewTeam(e.target.value)} className="px-2 py-1 text-sm border border-slate-300 rounded outline-none" />
                  <button type="button" onClick={() => { onUpdate(newTeam); setEditMode(false) }} className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded">저장</button>
                  <button type="button" onClick={() => { setNewTeam(user.team); setEditMode(false) }} className="px-3 py-1 text-xs font-bold text-slate-600 bg-slate-200 rounded">취소</button>
                </div>
              ) : (
                <p className="m-0 text-sm text-slate-500 mt-1 flex items-center gap-2">
                  소속: {user.team}
                  <button type="button" onClick={() => setEditMode(true)} className="text-blue-500 hover:text-blue-700"><SquarePen size={14} /></button>
                </p>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">닫기</button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
              <span className="block text-sm text-slate-500 mb-1">총 졸음/수면 알림</span>
              <strong className="text-2xl font-black text-slate-900">{alerts.length}건</strong>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
              <span className="block text-sm text-slate-500 mb-1">최근 접속 세션</span>
              <strong className="text-2xl font-black text-slate-900">{sessions.length}건</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="text-sm font-bold text-slate-700">조회 기간:</span>
            {[7, 30, null].map(days => (
              <button 
                key={days || 'all'} 
                type="button" 
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${filterDays === days ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                onClick={() => setFilterDays(days)}
              >
                {days ? `최근 ${days}일` : '전체'}
              </button>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">알림 이력</h3>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr><th className="p-3 font-medium border-b border-slate-100">일시</th><th className="p-3 font-medium border-b border-slate-100">단계</th><th className="p-3 font-medium border-b border-slate-100">내용</th></tr>
                </thead>
                <tbody>
                  {alerts.length > 0 ? alerts.map((a, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="p-3 whitespace-nowrap">{a.date} {a.time}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${a.level === 'L1' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {a.level === 'L1' ? '졸음' : '수면'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{a.note}</td>
                    </tr>
                  )) : <tr><td colSpan={3} className="p-4 text-center text-slate-500">해당 기간 내 알림 이력이 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">세션 이력</h3>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr><th className="p-3 font-medium border-b border-slate-100">날짜</th><th className="p-3 font-medium border-b border-slate-100">시작 시간</th><th className="p-3 font-medium border-b border-slate-100">이용 시간</th><th className="p-3 font-medium border-b border-slate-100">발생 알림</th></tr>
                </thead>
                <tbody>
                  {sessions.length > 0 ? sessions.map((s, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="p-3 whitespace-nowrap">{s.date}</td>
                      <td className="p-3">{s.startTime}</td>
                      <td className="p-3">{s.duration}</td>
                      <td className="p-3">
                        {s.alerts === '정상' ? <span className="text-emerald-600 font-medium">정상</span> : <span className="text-red-600 font-medium">{s.alerts}</span>}
                      </td>
                    </tr>
                  )) : <tr><td colSpan={4} className="p-4 text-center text-slate-500">해당 기간 내 접속 세션이 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <footer className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <button type="button" onClick={() => { if(confirm('정말 이 사용자를 삭제하시겠습니까?')) { onDelete(); onClose(); } }} className="text-sm font-bold text-red-500 hover:text-red-700">사용자 삭제</button>
          <p className="m-0 text-xs text-slate-400">ID: {userName.toLowerCase()}_{user.team.replace(/\s/g, '')}</p>
        </footer>
      </div>
    </div>
  )
}

function getWeekOfMonthStr(dateStr: string) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay()
  const week = Math.ceil((d.getDate() + firstDay) / 7)
  return `${d.getFullYear()}-${String(month).padStart(2, '0')} ${week}주차`
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [operatorCode, setOperatorCode] = useState('')
  const [password, setPassword] = useState('')

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const [activeTab, setActiveTab] = useState('dashboard')
  const [isEditMode, setIsEditMode] = useState(false)

  const [layouts, setLayouts] = useState<ResponsiveLayouts>(defaultLayouts)
  const [visibleWidgets, setVisibleWidgets] = useState<Record<WidgetId, boolean>>({
    activeUsers: true,
    riskUsers: true,
    alertFeed: true,
    hourlyTrend: true,
    sessionTable: true,
  })

  useEffect(() => {
    const savedLayouts = localStorage.getItem(LAYOUTS_STORAGE_KEY)
    if (savedLayouts) {
      try { setLayouts(JSON.parse(savedLayouts)) } catch (e) { console.error('Failed to parse layouts:', e) }
    }
    const savedVisible = localStorage.getItem(VISIBLE_STORAGE_KEY)
    if (savedVisible) {
      try { setVisibleWidgets(JSON.parse(savedVisible)) } catch (e) { console.error('Failed to parse visible widgets:', e) }
    }
  }, [])

  const handleLayoutChange = (_: any, allLayouts: ResponsiveLayouts) => {
    setLayouts(allLayouts)
    localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(allLayouts))
  }

  const toggleWidget = (id: WidgetId) => {
    const newVisible = { ...visibleWidgets, [id]: !visibleWidgets[id] }
    setVisibleWidgets(newVisible)
    localStorage.setItem(VISIBLE_STORAGE_KEY, JSON.stringify(newVisible))
  }

  const resetDashboard = () => {
    setLayouts(defaultLayouts)
    localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(defaultLayouts))
    const allVisible = { activeUsers: true, riskUsers: true, alertFeed: true, hourlyTrend: true, sessionTable: true }
    setVisibleWidgets(allVisible)
    localStorage.setItem(VISIBLE_STORAGE_KEY, JSON.stringify(allVisible))
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (operatorCode === 'ABC-123' && password === 'admin') setIsLoggedIn(true)
    else alert('운영자 코드 또는 비밀번호가 올바르지 않습니다. (ABC-123 / admin)')
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (operatorCode !== 'ABC-123') { alert('유효하지 않은 운영자 코드입니다.'); return; }
    alert('회원가입이 완료되었습니다. 로그인해 주세요.')
    setIsLoginMode(true)
    setPassword('')
    setOperatorCode('')
  }

  const [riskUsersState, setRiskUsersState] = useState<RiskUser[]>(initialRiskUsers)
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<string | null>(null)
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({})

  const [statType, setStatType] = useState<'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('hourly')
  const [statStartDate, setStatStartDate] = useState(weekAgoStr)
  const [statEndDate, setStatEndDate] = useState(todayStr)

  const [membersQuery, setMembersQuery] = useState('')
  const [membersTeamFilter, setMembersTeamFilter] = useState('all')
  const [email, setEmail] = useState('')
  const [team, setTeam] = useState('운수팀 A')
  const [showAddMember, setShowAddMember] = useState(false)

  const [alertFilterStartDate, setAlertFilterStartDate] = useState(weekAgoStr)
  const [alertFilterEndDate, setAlertFilterEndDate] = useState(todayStr)
  const [alertFilterLevel, setAlertFilterLevel] = useState<'all' | 'L1' | 'L2'>('all')

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Time,User,Team,Level,Note\n" 
      + alertItems.map(a => `${a.date},${a.time},${a.user},${a.team},${a.level},${a.note}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "alerts_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col items-center">
          <div className="grid w-16 h-16 place-items-center bg-slate-900 rounded-2xl text-white mb-6 shadow-md">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Eye:on Admin</h1>
          <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Secure Access Portal</p>
          
          <div className="flex w-full bg-slate-100 rounded-xl p-1 mb-8 mt-6">
            <button type="button" onClick={() => setIsLoginMode(true)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLoginMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>로그인</button>
            <button type="button" onClick={() => setIsLoginMode(false)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLoginMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>운영자 등록</button>
          </div>
          
          {isLoginMode ? (
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
              <input type="text" placeholder="운영자 코드" value={operatorCode} onChange={e => setOperatorCode(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 transition-colors" required />
              <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 transition-colors" required />
              <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:-translate-y-0.5 transition-transform">로그인</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
              <input type="text" placeholder="관리자 부여 조직 코드" value={operatorCode} onChange={e => setOperatorCode(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 transition-colors" required />
              <input type="email" placeholder="이메일" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 transition-colors" required />
              <input type="password" placeholder="사용할 비밀번호" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 transition-colors" required />
              <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-slate-900 text-white font-bold shadow-md hover:-translate-y-0.5 transition-transform">등록 요청</button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] min-h-screen bg-slate-50">
      {/* Sidebar - Dark Figma Theme */}
      <aside className="sticky top-0 flex flex-col h-screen p-6 bg-slate-950 text-slate-300 border-r border-slate-800 z-10 overflow-y-auto">
        <div className="flex items-center gap-3 pb-6 mb-2 border-b border-slate-800">
          <div className="grid w-10 h-10 place-items-center rounded-xl bg-blue-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.3)]">
            <ShieldAlert size={22} />
          </div>
          <div>
            <strong className="block text-xl font-bold text-slate-100 leading-none">Eye:on</strong>
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">Admin Portal</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 mt-4">
          {navigationItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-medium text-left ${activeTab === item.id ? 'bg-blue-500/15 text-blue-400 font-bold' : 'hover:bg-white/5 hover:text-slate-100'}`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button onClick={() => setActiveTab('account')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-medium text-left border border-slate-800 ${activeTab === 'account' ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-900 hover:bg-white/5 hover:text-slate-100'}`}>
            <div className="grid w-8 h-8 place-items-center rounded-lg bg-slate-800 text-slate-300">
              <UserCircle size={18} />
            </div>
            <div>
              <span className="block text-sm text-slate-100 font-bold leading-none">관리자</span>
              <span className="text-xs text-slate-500">admin@eyeon.com</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Workspace - Light Figma Theme */}
      <main className="p-4 md:p-8 overflow-y-auto text-slate-900 h-screen max-w-[1600px] mx-auto w-full">
        {activeTab === 'dashboard' && (
          <>
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 m-0 mb-1">대시보드</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-600">
                  <Clock3 size={16} /> {currentTime.toLocaleString('ko-KR')} 기준
                </div>
                <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-bold shadow-sm transition-colors ${isEditMode ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  {isEditMode ? <><Check size={16} /> 편집 완료</> : <><SquarePen size={16} /> 위젯 편집</>}
                </button>
                <button onClick={resetDashboard} className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                  <RotateCcw size={16} /> 위젯 초기화
                </button>
              </div>
            </header>

            <div className="mb-6 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 m-0">대시보드 위젯 설정</h2>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{Object.values(visibleWidgets).filter(v => v).length}개 활성화됨</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {widgetOrder.map(id => (
                  <button
                    key={id}
                    onClick={() => toggleWidget(id)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-all ${visibleWidgets[id] ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${visibleWidgets[id] ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                    {widgetMeta[id].title}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveGridLayout
              className={`min-h-[400px] ${isEditMode ? 'is-editing' : ''}`}
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={30}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".drag-handle"
              isDraggable={isEditMode}
              isResizable={isEditMode}
              compactType="vertical"
              preventCollision={false}
              margin={[16, 16]}
            >
              {widgetOrder.filter(id => visibleWidgets[id]).map(id => (
                <div key={id} data-grid={defaultLayouts.lg?.find(l => l.i === id)} className="flex flex-col bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden group">
                  <div className={`${isEditMode ? 'drag-handle cursor-move' : ''} flex items-center justify-between p-3 border-b border-slate-50 bg-slate-50/50`}>
                    <h3 className="text-sm font-bold text-slate-700 m-0 flex items-center gap-2">
                      {isEditMode && <Move size={14} className="text-slate-400" />} {widgetMeta[id].title}
                    </h3>
                    {isEditMode && <button onClick={() => toggleWidget(id)} className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">✕</button>}
                  </div>
                  <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    {id === 'activeUsers' && (() => {
                      const total = riskUsersState.length;
                      const active = riskUsersState.filter(u => u.isOnline).length;
                      const alerting = alertItems.filter(a => a.status === '진행중' && riskUsersState.find(u => u.name === a.user)?.isOnline).length;
                      return (
                        <div className="flex flex-col h-full justify-between gap-4">
                          <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                            <p className="text-xs font-bold text-slate-500 m-0 mb-1">총 구성원</p>
                            <strong className="text-4xl font-black text-slate-900">{total}</strong>
                          </div>
                          <div className="flex-1 p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center">
                            <p className="text-xs font-bold text-blue-500 m-0 mb-1">현재 활성화</p>
                            <strong className="text-4xl font-black text-blue-700">{active}</strong>
                          </div>
                          <div className="flex-1 p-4 rounded-xl bg-red-50 border border-red-100 flex flex-col items-center justify-center text-center">
                            <p className="text-xs font-bold text-red-500 m-0 mb-1">실시간 경고</p>
                            <strong className="text-4xl font-black text-red-700">{alerting}</strong>
                          </div>
                        </div>
                      )
                    })()}
                    {id === 'riskUsers' && (
                      <div className="flex flex-col gap-2">
                        {riskUsersState.slice(0, 5).map(u => (
                          <button key={u.name} onClick={() => setSelectedUserForDetail(u.name)} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all text-left w-full">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${u.alertCount >= 5 ? 'bg-red-500' : u.alertCount >= 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              <div>
                                <strong className="block text-sm font-bold text-slate-900 leading-none mb-1">{u.name}</strong>
                                <span className="text-xs text-slate-500">{u.team}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Alerts</span>
                              <strong className={`text-sm font-black ${u.alertCount > 0 ? 'text-red-500' : 'text-slate-500'}`}>{u.alertCount}</strong>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {id === 'alertFeed' && (
                      <div className="flex flex-col gap-3">
                        {alertItems.slice(0, 4).map((a, i) => (
                          <div key={i} className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider ${a.level === 'L1' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                  {a.level}
                                </span>
                                <strong className="text-sm text-slate-900">{a.user}</strong>
                              </div>
                              <span className="text-xs font-bold text-slate-400">{a.time}</span>
                            </div>
                            <p className="m-0 text-sm text-slate-600">{a.note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {id === 'hourlyTrend' && (
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-slate-500">피크 시간: 22:00</span>
                          <span className="text-xs font-bold text-slate-500">누적: {alertItems.length}건</span>
                        </div>
                        <div className="flex-1 min-h-[150px] relative w-full h-full">
                          <ResponsiveContainer width="99%" height="100%" minHeight={150}>
                            <LineChart data={hourlyTrendData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    {id === 'sessionTable' && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-500 bg-slate-50">
                            <tr><th className="p-3 font-bold rounded-tl-lg">상태</th><th className="p-3 font-bold">사용자</th><th className="p-3 font-bold">시간</th><th className="p-3 font-bold rounded-tr-lg">이용시간</th></tr>
                          </thead>
                          <tbody>
                            {sessionRows.slice(0, 5).map((s, i) => (
                              <tr key={i} className="border-b border-slate-50 last:border-0">
                                <td className="p-3"><div className={`w-2 h-2 rounded-full ${s.alerts === '정상' ? 'bg-emerald-500' : 'bg-red-500'}`}></div></td>
                                <td className="p-3 font-bold text-slate-900">{s.user}</td>
                                <td className="p-3 text-slate-500">{s.startTime}</td>
                                <td className="p-3 text-slate-500">{s.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </ResponsiveGridLayout>
          </>
        )}

        {activeTab === 'live' && (
          <div className="flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 m-0 mb-1">실시간 모니터링</h1>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 시스템 정상 가동 중
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <SummaryCard icon={Activity} label="현재 모니터링 인원" value={riskUsersState.filter(u => u.isOnline).length.toString()} detail={`활성화 ${riskUsersState.filter(u => u.isOnline).length}명 / 비활성화 ${riskUsersState.filter(u => !u.isOnline).length}명`} />
              <SummaryCard icon={BellRing} label="금일 경고 알림" value={alertItems.filter(a => a.date === todayStr).length.toString()} detail={`졸음 ${alertItems.filter(a => a.date === todayStr && a.level === 'L1').length}건 / 수면 ${alertItems.filter(a => a.date === todayStr && a.level === 'L2').length}건`} />
            </div>

            {(() => {
              const activeAlerts = alertItems.filter(a => a.status === '진행중' && riskUsersState.find(u => u.name === a.user)?.isOnline);
              const activeUsers = riskUsersState.filter(u => u.isOnline);
              return (
                <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1 flex flex-col gap-6 min-w-0">
                    <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <h2 className="text-lg font-black text-slate-900 mb-6">이번 세션 모니터링 목록 ({activeUsers.length})</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {activeUsers.map(user => {
                          const currentSession = sessionRows.find(s => s.user === user.name && s.date === todayStr) || { duration: '0h 0m', alerts: '정상' };
                          const isActiveAlert = activeAlerts.some(a => a.user === user.name);
                          const isExpanded = expandedUsers[user.name];
                          const userAlerts = alertItems.filter(a => a.user === user.name && a.date === todayStr);
                          
                          return (
                            <div key={user.name} className={`flex flex-col p-4 border rounded-xl shadow-sm transition-all bg-white ${isActiveAlert ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300'}`}>
                              <div className="flex justify-between items-start mb-3 w-full">
                                <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${isActiveAlert ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {isActiveAlert ? '위험' : '정상'}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">{currentSession.duration}</span>
                              </div>
                              <strong className="text-lg font-black text-slate-900 mb-1">{user.name}</strong>
                              <span className="text-xs text-slate-500 mb-3">{user.team}</span>
                              
                              <div className="mt-auto flex justify-end">
                                <button onClick={() => setExpandedUsers(prev => ({ ...prev, [user.name]: !prev[user.name] }))} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                              </div>
                              
                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                                  {userAlerts.length > 0 ? userAlerts.map((a, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs">
                                      <span className="text-slate-500 font-medium">{a.time}</span>
                                      <span className={`font-bold ${a.level === 'L2' ? 'text-red-600' : 'text-amber-500'}`}>{a.note}</span>
                                    </div>
                                  )) : (
                                    <p className="text-xs text-slate-400 text-center m-0">발생한 경고 알림이 없습니다.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full xl:w-[360px] shrink-0">
                    <div className={`p-6 rounded-2xl shadow-sm border ${activeAlerts.length > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'} sticky top-6`}>
                      <h2 className={`text-lg font-black mb-6 flex items-center gap-2 ${activeAlerts.length > 0 ? 'text-red-700' : 'text-slate-500'}`}>
                        <BellRing size={20} className={activeAlerts.length > 0 ? 'animate-pulse' : ''} /> 
                        진행 중인 경고 ({activeAlerts.length})
                      </h2>
                      <div className="flex flex-col gap-4">
                        {activeAlerts.length > 0 ? activeAlerts.map((alert, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-red-200 shadow-sm flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <strong className="text-red-700 font-bold block mb-1">{alert.user}</strong>
                                <span className="text-xs text-slate-500">{alert.team}</span>
                              </div>
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${alert.level === 'L2' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>{alert.level === 'L2' ? '수면' : '졸음'}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 m-0">{alert.note}</p>
                            <div className="text-xs text-slate-400 mt-1">{alert.time} 발생</div>
                          </div>
                        )) : (
                          <div className="text-center py-12 flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                              <Check size={24} />
                            </div>
                            <p className="text-sm font-bold text-slate-400 m-0">현재 울리고 있는<br/>경고 알림이 없습니다.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 m-0 mb-1">구성원 관리</h1>
              </div>
              <button onClick={() => setShowAddMember(true)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors">
                + 구성원 추가
              </button>
            </header>

            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="이름 또는 부서 검색" value={membersQuery} onChange={e => setMembersQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm font-medium" />
                </div>
                <select value={membersTeamFilter} onChange={e => setMembersTeamFilter(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm font-medium">
                  <option value="all">모든 부서</option>
                  {Array.from(new Set(riskUsersState.map(u => u.team))).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr><th className="p-4 font-bold border-b border-slate-100 rounded-tl-xl">이름</th><th className="p-4 font-bold border-b border-slate-100">부서</th><th className="p-4 font-bold border-b border-slate-100">상태</th><th className="p-4 font-bold border-b border-slate-100 rounded-tr-xl">관리</th></tr>
                  </thead>
                  <tbody>
                    {riskUsersState.filter(u => (membersTeamFilter === 'all' || u.team === membersTeamFilter) && u.name.includes(membersQuery)).map(u => (
                      <tr key={u.name} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{u.name}</td>
                        <td className="p-4 text-slate-600">{u.team}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">활성</span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => setSelectedUserForDetail(u.name)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg text-xs font-bold transition-colors shadow-sm">
                            상세 정보
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 m-0 mb-1">알림 기록</h1>
              </div>
              <button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-sm">
                CSV 내보내기
              </button>
            </header>

            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-slate-600">기간:</label>
                  <input type="date" value={alertFilterStartDate} onChange={e => setAlertFilterStartDate(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-sm font-medium bg-white" />
                  <span className="text-slate-400">~</span>
                  <input type="date" value={alertFilterEndDate} onChange={e => setAlertFilterEndDate(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-sm font-medium bg-white" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-slate-600">단계:</label>
                  <select value={alertFilterLevel} onChange={e => setAlertFilterLevel(e.target.value as any)} className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-sm font-medium bg-white">
                    <option value="all">전체</option>
                    <option value="L1">졸음</option>
                    <option value="L2">수면</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr><th className="p-4 font-bold border-b border-slate-100">일시</th><th className="p-4 font-bold border-b border-slate-100">사용자</th><th className="p-4 font-bold border-b border-slate-100">소속</th><th className="p-4 font-bold border-b border-slate-100">단계</th><th className="p-4 font-bold border-b border-slate-100">내용</th></tr>
                  </thead>
                  <tbody>
                    {alertItems.filter(item => {
                      const t = new Date(item.date).getTime()
                      const start = new Date(alertFilterStartDate).getTime()
                      const end = new Date(alertFilterEndDate).getTime()
                      if (t < start || t > end) return false
                      if (alertFilterLevel !== 'all' && item.level !== alertFilterLevel) return false
                      return true
                    }).map((item, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-slate-600 whitespace-nowrap">{item.date} {item.time}</td>
                        <td className="p-4 font-bold text-slate-900">{item.user}</td>
                        <td className="p-4 text-slate-600">{item.team}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider ${item.level === 'L1' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {item.level === 'L1' ? '졸음' : '수면'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (() => {
          const filtered = alertItems.filter(item => {
            const t = new Date(item.date).getTime();
            return !(t < new Date(statStartDate).getTime() || t > new Date(statEndDate).getTime());
          })
          const grouped = filtered.reduce((acc, item) => {
            let key = ''
            if (statType === 'hourly') { const h = parseInt(item.time.split(':')[0]); key = `${item.date} ${String(h).padStart(2, '0')}:00` }
            else if (statType === 'daily') { key = item.date }
            else if (statType === 'weekly') { key = getWeekOfMonthStr(item.date) }
            else if (statType === 'monthly') { key = `${item.date.substring(0, 4)}-${item.date.substring(5, 7)}월` }
            else if (statType === 'yearly') { key = `${item.date.substring(0, 4)}년` }
            if (!acc[key]) acc[key] = { key, total: 0, l1: 0, l2: 0, items: [] }
            acc[key].total++; if (item.level === 'L1') acc[key].l1++; if (item.level === 'L2') acc[key].l2++; acc[key].items.push(item); return acc
          }, {} as Record<string, any>)
          
          const statResult = Object.values(grouped).sort((a: any, b: any) => a.key.localeCompare(b.key)); 
          const chartData = statResult.map(r => ({
            name: statType === 'hourly' ? r.key.split(' ')[1] : statType === 'monthly' ? r.key : r.key.split('-').pop(),
            l1: r.l1,
            l2: r.l2,
            total: r.total
          }))

          const totalSessions = sessionRows.filter(s => { const t = new Date(s.date).getTime(); return !(t < new Date(statStartDate).getTime() || t > new Date(statEndDate).getTime()) }).length;
          const totalAlerts = filtered.length;
          const totalL1 = filtered.filter(a => a.level === 'L1').length;
          const totalL2 = filtered.filter(a => a.level === 'L2').length;
          const riskUsersStats = Object.entries(filtered.reduce((acc, a) => { acc[a.user] = (acc[a.user] || 0) + 1; return acc; }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).slice(0, 5);

          return (
            <div className="flex flex-col gap-6">
              <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 m-0 mb-1">분석</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                  {['hourly', 'daily', 'weekly', 'monthly', 'yearly'].map(type => (
                    <button 
                      key={type}
                      type="button" 
                      className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-all ${statType === type ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`} 
                      onClick={() => { 
                        setStatType(type as any); 
                        if(type==='yearly') {setStatStartDate('2024-01-01'); setStatEndDate('2026-12-31')}
                        else if(type==='monthly') {setStatStartDate('2026-01-01'); setStatEndDate('2026-12-31')}
                        else {setStatStartDate(weekAgoStr); setStatEndDate(todayStr)}
                      }}>
                      {type === 'hourly' ? '시간대' : type === 'daily' ? '일' : type === 'weekly' ? '주' : type === 'monthly' ? '월' : '년'}
                    </button>
                  ))}
                  <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                  <input type="date" value={statStartDate} onChange={e => setStatStartDate(e.target.value)} className="px-2 py-1 bg-transparent text-sm font-bold text-slate-600 outline-none" />
                  <span className="text-slate-400">~</span>
                  <input type="date" value={statEndDate} onChange={e => setStatEndDate(e.target.value)} className="px-2 py-1 bg-transparent text-sm font-bold text-slate-600 outline-none" />
                </div>
              </header>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <p className="text-sm font-bold text-slate-500 mb-2">해당 기간 총 세션</p>
                  <p className="text-3xl font-black text-slate-900 m-0">{totalSessions}</p>
                </div>
                <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <p className="text-sm font-bold text-slate-500 mb-2">졸음</p>
                  <p className="text-3xl font-black text-amber-500 m-0">{totalL1}</p>
                </div>
                <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <p className="text-sm font-bold text-slate-500 mb-2">수면</p>
                  <p className="text-3xl font-black text-red-500 m-0">{totalL2}</p>
                </div>
                <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <p className="text-sm font-bold text-slate-500 mb-2">전체 발생 알림</p>
                  <p className="text-3xl font-black text-slate-900 m-0">{totalAlerts}</p>
                </div>
              </div>

              {chartData.length > 0 ? (
                <>
                  <section className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-black text-slate-900 m-0">추이 분석 (Recharts)</h2>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> <span className="text-xs font-bold text-slate-500">졸음</span></div>
                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> <span className="text-xs font-bold text-slate-500">수면</span></div>
                      </div>
                    </div>
                    <div className="w-full h-[300px] min-h-[300px] min-w-0">
                      <ResponsiveContainer width="99%" height={300}>
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                          <Line type="monotone" dataKey="l1" name="졸음" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="l2" name="수면" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <h2 className="text-lg font-black text-slate-900 m-0 mb-4">데이터 테이블</h2>
                      <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500">
                            <tr><th className="p-3 font-bold border-b border-slate-100">기준</th><th className="p-3 font-bold border-b border-slate-100">총 알림</th><th className="p-3 font-bold border-b border-slate-100">졸음</th><th className="p-3 font-bold border-b border-slate-100">수면</th></tr>
                          </thead>
                          <tbody>
                            {statResult.slice(0, 5).map((row: any) => (
                              <tr key={row.key} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 font-bold text-slate-700">{statType === 'hourly' ? row.key.split(' ')[1] : row.key}</td>
                                <td className="p-3 font-black text-slate-900">{row.total}</td>
                                <td className="p-3 text-amber-600 font-bold">{row.l1}</td>
                                <td className="p-3 text-red-600 font-bold">{row.l2}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <h2 className="text-lg font-black text-slate-900 m-0 mb-4">주의가 필요한 사용자 Top 5</h2>
                      <div className="flex flex-col gap-3">
                        {riskUsersStats.map(([name, count], index) => {
                          const userMeta = riskUsersState.find(u => u.name === name)
                          return (
                            <div key={name} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="grid w-8 h-8 place-items-center rounded-full bg-red-100 text-red-600 font-black text-sm">{index + 1}</div>
                                <div>
                                  <strong className="block text-sm font-bold text-slate-900">{name}</strong>
                                  <span className="text-xs text-slate-500">{userMeta?.team || '알 수 없음'}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">알림</span>
                                <strong className="text-base font-black text-red-600 leading-none">{count}건</strong>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  </div>
                </>
              ) : <div className="p-12 text-center text-slate-500 bg-white border border-slate-100 rounded-2xl shadow-sm font-bold">해당 조건에 맞는 데이터가 없습니다.</div>}
            </div>
          )
        })()}
        
        {activeTab === 'account' && (
          <div className="flex flex-col gap-6">
            <header className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 m-0 mb-1">계정 설정</h1>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6">비밀번호 변경</h3>
                <form onSubmit={e => { e.preventDefault(); alert('비밀번호가 변경되었습니다.'); }} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">새 비밀번호</label>
                    <input type="password" placeholder="새로운 비밀번호를 입력하세요" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">비밀번호 확인</label>
                    <input type="password" placeholder="다시 한번 입력하세요" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">조직 코드</label>
                    <input type="text" placeholder="인증을 위한 조직 코드를 입력하세요" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm" required />
                  </div>
                  <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-slate-900 text-white font-bold shadow-md hover:-translate-y-0.5 transition-transform">변경 사항 저장</button>
                </form>
              </div>

              <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm h-fit">
                <h3 className="text-lg font-black text-red-600 mb-6">시스템 로그아웃</h3>
                <p className="text-sm text-slate-500 mb-6">보안을 위해 사용이 끝나면 로그아웃 해주세요.</p>
                <button type="button" onClick={() => setIsLoggedIn(false)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold hover:bg-red-100 transition-colors">
                  <LogOut size={18} /> 안전하게 로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedUserForDetail && <UserDetailModal userName={selectedUserForDetail} riskUsers={riskUsersState} alertItems={alertItems} sessionRows={sessionRows} onClose={() => setSelectedUserForDetail(null)} onDelete={() => { setRiskUsersState(prev => prev.filter(u => u.name !== selectedUserForDetail)) }} onUpdate={(team) => { setRiskUsersState(prev => prev.map(u => u.name === selectedUserForDetail ? { ...u, team } : u)) }} />}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-xl">
            <header className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="m-0 text-xl font-black text-slate-900">구성원 추가</h2>
              <button type="button" onClick={() => setShowAddMember(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">닫기</button>
            </header>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-6">새로운 구성원의 이메일과 소속을 입력하세요.</p>
              <form onSubmit={e => { e.preventDefault(); alert(`${email} 구성원이 추가되었습니다.`); setShowAddMember(false); setEmail(''); }} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">이메일</label>
                  <input type="email" placeholder="user@eyeon.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">초기 소속 (팀)</label>
                  <input type="text" placeholder="소속 팀 입력" value={team} onChange={e => setTeam(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm" required />
                </div>
                <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:-translate-y-0.5 transition-transform">구성원 추가 완료</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
