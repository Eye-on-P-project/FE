import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
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
  Sparkles,
  SquarePen,
  UserCircle,
  Zap,
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

import { Toaster, toast } from 'react-hot-toast'
import apiClient, { clearAccessToken, ensureWebSession, getAccessToken, setAccessToken } from './api/client'
import { changeMyPassword } from './api/account'
import {
  addOrganizationMember,
  fetchOrganizationMembers,
  removeOrganizationMember,
} from './api/members'
import {
  fetchDashboardNotifications,
  fetchDashboardHourlyRisk24h,
  fetchDashboardRecentEndedSessions,
  fetchMyOrganizationId,
  fetchOrganizationRiskStats,
  fetchOrganizationRiskUsers,
  streamRealtimeSummary,
} from './api/monitoring'
import type {
  LoginResponse,
  MonitoringHourlyRisk24hResponse,
  MonitoringNotificationResponse,
  MonitoringRecentEndedSessionResponse,
  OrganizationMemberResponse,
  OrganizationRiskStatsResponse,
  OrganizationRiskUserResponse,
  RealtimeSummaryResponse,
  RiskStatsGranularity,
} from './types/api'

import {
  navigationItems,
  widgetOrder,
  widgetMeta,
  defaultLayouts,
  initialRiskUsers,
  sessionRows as initialSessionRows,
  todayStr,
  weekAgoStr
} from './data/mockData'
import type { RiskUser, AlertItem, SessionRow, WidgetId } from './types'

const ResponsiveGridLayout = WidthProvider(Responsive)

const LAYOUTS_STORAGE_KEY = 'eyeon-admin-layouts'
const VISIBLE_STORAGE_KEY = 'eyeon-admin-visible-widgets'
const NOTIFICATION_PAGE_SIZE = 50
const MAX_ALERT_ITEMS = 500
const SYSTEM_ADMIN_PATH = '/admin'

function redirectToSystemAdmin() {
  if (!window.location.pathname.startsWith(SYSTEM_ADMIN_PATH)) {
    window.location.replace(SYSTEM_ADMIN_PATH)
  }
}

function serializeLayouts(layouts: ResponsiveLayouts) {
  return JSON.stringify(layouts)
}

function isRealtimeSummaryEqual(
  previous: RealtimeSummaryResponse | null,
  next: RealtimeSummaryResponse
) {
  if (!previous) {
    return false
  }

  return (
    previous.totalMemberCount === next.totalMemberCount
    && previous.activeSessionCount === next.activeSessionCount
    && previous.warningSessionCount === next.warningSessionCount
    && previous.drowsyWarningSessionCount === next.drowsyWarningSessionCount
    && previous.sleepWarningSessionCount === next.sleepWarningSessionCount
  )
}

function DashboardClockBadge() {
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-600">
      <Clock3 size={16} /> {currentTime.toLocaleString('ko-KR')} 기준
    </div>
  )
}

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

function UserDetailModal({ userName, riskUsers: _riskUsers, alertItems, sessionRows, onClose, onDelete }: { userName: string, riskUsers: RiskUser[], alertItems: AlertItem[], sessionRows: SessionRow[], onClose: () => void, onDelete: () => void }) {
  const [filterDays, setFilterDays] = useState<number | null>(7)
  

  const filterByDate = (date: string) => {
    if (!filterDays) return true
    const today = parseDateLike(todayStr)
    const target = parseDateLike(date)
    if (!today || !target) return false
    return (today.getTime() - target.getTime()) / 86400000 <= filterDays
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
          <p className="m-0 text-xs text-slate-400">ID: {userName.toLowerCase()}</p>
        </footer>
      </div>
    </div>
  )
}

function extractApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }
  return fallbackMessage
}

const statTypeToGranularity: Record<'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly', RiskStatsGranularity> = {
  hourly: 'HOUR',
  daily: 'DAY',
  weekly: 'WEEK',
  monthly: 'MONTH',
  yearly: 'YEAR',
}

function getDateBefore(baseDate: Date, days: number) {
  const date = new Date(baseDate)
  date.setDate(date.getDate() - days)
  return date
}

function toInputDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseDateLike(value: string | null | undefined) {
  if (!value || typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  if (!normalized) {
    return null
  }

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  )
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const hour = Number(match[4] ?? '0')
    const minute = Number(match[5] ?? '0')
    const second = Number(match[6] ?? '0')
    return new Date(year, month - 1, day, hour, minute, second)
  }

  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

function formatHourLabel(dateTime: string) {
  const date = parseDateLike(dateTime)
  if (!date) {
    return '-'
  }
  return `${String(date.getHours()).padStart(2, '0')}:00`
}

function formatBucketLabel(
  bucketStart: string,
  bucketEnd: string,
  statType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'
) {
  const start = parseDateLike(bucketStart)
  const end = parseDateLike(bucketEnd)
  if (!start || !end) {
    return '-'
  }

  if (statType === 'hourly') {
    return `${start.getMonth() + 1}/${start.getDate()} ${String(start.getHours()).padStart(2, '0')}:00`
  }
  if (statType === 'daily') {
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
  }
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}~${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
}

function formatBucketTickLabel(
  bucketStart: string,
  bucketEnd: string,
  statType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'
) {
  const start = parseDateLike(bucketStart)
  const end = parseDateLike(bucketEnd)
  if (!start || !end) {
    return '-'
  }

  if (statType === 'hourly') {
    return `${start.getMonth() + 1}/${start.getDate()} ${String(start.getHours()).padStart(2, '0')}:00`
  }
  if (statType === 'daily') {
    return `${start.getMonth() + 1}/${start.getDate()}`
  }
  return `${start.getMonth() + 1}/${start.getDate()}~${end.getMonth() + 1}/${end.getDate()}`
}

function formatMemberRole(role: string | null | undefined) {
  if (role === 'ADMIN') {
    return '관리자'
  }
  if (role === 'USER') {
    return '구성원'
  }
  return role ?? '미정'
}

function formatMemberCreatedAt(createdAt: string | null | undefined) {
  const parsed = parseDateLike(createdAt)
  if (!parsed) {
    return '-'
  }
  return parsed.toLocaleString('ko-KR')
}

function formatSessionDate(dateTime: string) {
  const parsed = parseDateLike(dateTime)
  if (!parsed) {
    return '-'
  }
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
}

function formatSessionTime(dateTime: string) {
  const parsed = parseDateLike(dateTime)
  if (!parsed) {
    return '-'
  }
  return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
}

function formatSessionDuration(durationMinutes: number | null | undefined) {
  const totalMinutes = Math.max(0, Number(durationMinutes ?? 0))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

function formatSessionAlerts(drowsyCount: number, sleepCount: number) {
  const alerts: string[] = []
  if (drowsyCount > 0) {
    alerts.push(`졸음 ${drowsyCount}회`)
  }
  if (sleepCount > 0) {
    alerts.push(`수면 ${sleepCount}회`)
  }
  return alerts.length > 0 ? alerts.join(' / ') : '정상'
}

function mapRiskUsersResponseToWidgetRows(response: OrganizationRiskUserResponse[]): RiskUser[] {
  return response.map((row) => {
    const resolvedName = row.name?.trim() || row.nickname?.trim() || row.email?.trim() || `사용자 ${row.userId}`
    return {
      name: resolvedName,
      alertCount: row.totalRiskCount,
      sessionsToday: row.totalSessionCount,
      isOnline: row.isMonitoringActive,
    }
  })
}

function mapRecentEndedSessionsToRows(response: MonitoringRecentEndedSessionResponse[]): SessionRow[] {
  return response.map((row) => ({
    user: row.userName?.trim() || `사용자 ${row.userId}`,
    date: formatSessionDate(row.startedAtApp),
    startTime: formatSessionTime(row.startedAtApp),
    duration: formatSessionDuration(row.durationMinutes),
    alerts: formatSessionAlerts(row.drowsyCount, row.sleepCount),
  }))
}

function mapNotificationToAlertItem(
  notification: MonitoringNotificationResponse,
  status: AlertItem['status'] = '종료됨'
): AlertItem {
  const level = notification.type === 'SLEEP' ? 'L2' : 'L1'
  const note = notification.content?.trim().length
    ? notification.content
    : level === 'L2'
      ? '수면 상태 경고가 감지되었습니다.'
      : '졸음 의심 경고가 감지되었습니다.'

  return {
    notificationId: notification.notificationId ?? undefined,
    userId: notification.userId,
    user: notification.userName?.trim() || `사용자 ${notification.userId}`,
    level,
    date: formatSessionDate(notification.occurredAt),
    time: formatSessionTime(notification.occurredAt),
    note,
    occurredAt: notification.occurredAt,
    status,
  }
}

function getAlertTimestamp(item: AlertItem): number {
  if (item.occurredAt) {
    const occurredAtDate = parseDateLike(item.occurredAt)
    const occurredAtTime = occurredAtDate ? occurredAtDate.getTime() : Number.NaN
    if (!Number.isNaN(occurredAtTime)) {
      return occurredAtTime
    }
  }
  const fallbackDate = parseDateLike(`${item.date}T${item.time}:00`)
  const fallbackTime = fallbackDate ? fallbackDate.getTime() : Number.NaN
  return Number.isNaN(fallbackTime) ? 0 : fallbackTime
}

function mergeAlertItems(previous: AlertItem[], incoming: AlertItem[]): AlertItem[] {
  const mergedMap = new Map<string, AlertItem>()
  const put = (item: AlertItem) => {
    const key = item.notificationId ?? `${item.user}|${item.level}|${item.date}|${item.time}|${item.note}`
    mergedMap.set(key, item)
  }

  previous.forEach(put)
  incoming.forEach(put)

  return Array.from(mergedMap.values())
    .sort((a, b) => getAlertTimestamp(b) - getAlertTimestamp(a))
    .slice(0, MAX_ALERT_ITEMS)
}

function applyRealtimeNotification(previous: AlertItem[], notification: MonitoringNotificationResponse): AlertItem[] {
  if (notification.type === 'NORMAL') {
    return previous.map((item) =>
      item.userId === notification.userId && item.status === '진행중'
        ? { ...item, status: '종료됨' as const }
        : item
    )
  }

  const nextAlert = mapNotificationToAlertItem(notification, '진행중')
  const closedPrevious = previous.map((item) =>
    item.userId === nextAlert.userId && item.status === '진행중'
      ? { ...item, status: '종료됨' as const }
      : item
  )
  return mergeAlertItems(closedPrevious, [nextAlert])
}

import { getCurrentSubscription } from './api/subscription'
import type { SubscriptionInfo } from './types/subscription'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthInitializing, setIsAuthInitializing] = useState(true)
  const [operatorCode, setOperatorCode] = useState('')
  const [password, setPassword] = useState('')

  const [accountCurrentPassword, setAccountCurrentPassword] = useState('')
  const [accountNewPassword, setAccountNewPassword] = useState('')
  const [accountNewPasswordConfirm, setAccountNewPasswordConfirm] = useState('')
  const [accountOrganizationCode, setAccountOrganizationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)

  useEffect(() => {
    let isMounted = true

    const restoreWebSession = async () => {
      const session = await ensureWebSession()
      if (!isMounted) {
        return
      }

      if (session?.role === 'SYSTEM_ADMIN') {
        redirectToSystemAdmin()
        return
      }

      const hasValidSession = Boolean(session)
      setIsLoggedIn(hasValidSession)
      setIsAuthInitializing(false)
      
      // Fetch subscription if logged in
      if (hasValidSession) {
        try {
          const subData = await getCurrentSubscription()
          setSubscription(subData)
        } catch (error) {
          console.error('Failed to fetch subscription:', error)
        }
      }
    }

    restoreWebSession()
    return () => {
      isMounted = false
    }
  }, [])

  const [activeTab, setActiveTab] = useState('dashboard')
  const [isEditMode, setIsEditMode] = useState(false)

  const [layouts, setLayouts] = useState<ResponsiveLayouts>(defaultLayouts)
  const latestLayoutsSerializedRef = useRef(serializeLayouts(defaultLayouts))
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
      try {
        const parsedLayouts = JSON.parse(savedLayouts) as ResponsiveLayouts
        setLayouts(parsedLayouts)
        latestLayoutsSerializedRef.current = serializeLayouts(parsedLayouts)
      } catch (e) {
        console.error('Failed to parse layouts:', e)
      }
    }
    const savedVisible = localStorage.getItem(VISIBLE_STORAGE_KEY)
    if (savedVisible) {
      try { setVisibleWidgets(JSON.parse(savedVisible)) } catch (e) { console.error('Failed to parse visible widgets:', e) }
    }
  }, [])

  const handleLayoutChange = (_: any, allLayouts: ResponsiveLayouts) => {
    const nextSerializedLayouts = serializeLayouts(allLayouts)
    if (nextSerializedLayouts === latestLayoutsSerializedRef.current) {
      return
    }
    latestLayoutsSerializedRef.current = nextSerializedLayouts
    setLayouts(allLayouts)
    localStorage.setItem(LAYOUTS_STORAGE_KEY, nextSerializedLayouts)
  }

  const toggleWidget = (id: WidgetId) => {
    const newVisible = { ...visibleWidgets, [id]: !visibleWidgets[id] }
    setVisibleWidgets(newVisible)
    localStorage.setItem(VISIBLE_STORAGE_KEY, JSON.stringify(newVisible))
  }

  const resetDashboard = () => {
    const serializedDefaultLayouts = serializeLayouts(defaultLayouts)
    setLayouts(defaultLayouts)
    latestLayoutsSerializedRef.current = serializedDefaultLayouts
    localStorage.setItem(LAYOUTS_STORAGE_KEY, serializedDefaultLayouts)
    const allVisible = { activeUsers: true, riskUsers: true, alertFeed: true, hourlyTrend: true, sessionTable: true }
    setVisibleWidgets(allVisible)
    localStorage.setItem(VISIBLE_STORAGE_KEY, JSON.stringify(allVisible))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await apiClient.post<LoginResponse>('/api/auth/login', {
        email: operatorCode,
        password: password
      })
      setAccessToken(response.data.accessToken)
      if (response.data.role === 'SYSTEM_ADMIN') {
        toast.success('시스템 관리자 페이지로 이동합니다.')
        redirectToSystemAdmin()
        return
      }
      toast.success('로그인에 성공했습니다!')
      setIsLoggedIn(true)
    } catch (error: unknown) {
      console.error('Login error:', error)
      const errorMsg = extractApiErrorMessage(error, '로그인에 실패했습니다. 입력 정보를 확인해 주세요.')
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
      const errorMsg = extractApiErrorMessage(error, '로그아웃 처리 중 오류가 발생했습니다.')
      toast.error(errorMsg)
    } finally {
      clearAccessToken()
      setIsLoggedIn(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (accountNewPassword !== accountNewPasswordConfirm) {
      toast.error('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      return
    }

    setIsChangingPassword(true)
    try {
      await changeMyPassword({
        currentPassword: accountCurrentPassword,
        newPassword: accountNewPassword,
        organizationCode: accountOrganizationCode.trim(),
      })
      toast.success('비밀번호가 변경되었습니다.')
      setAccountCurrentPassword('')
      setAccountNewPassword('')
      setAccountNewPasswordConfirm('')
      setAccountOrganizationCode('')
    } catch (error: unknown) {
      toast.error(extractApiErrorMessage(error, '비밀번호 변경에 실패했습니다.'))
    } finally {
      setIsChangingPassword(false)
    }
  }

  const [riskUsersState, setRiskUsersState] = useState<RiskUser[]>(initialRiskUsers)
  const [isRiskUsersLoading, setIsRiskUsersLoading] = useState(false)
  const [alertItems, setAlertItems] = useState<AlertItem[]>([])
  const [notificationsNextCursor, setNotificationsNextCursor] = useState<string | null>(null)
  const [hasMoreNotifications, setHasMoreNotifications] = useState(false)
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)
  const [isLoadingMoreNotifications, setIsLoadingMoreNotifications] = useState(false)
  const [sessionRows, setSessionRows] = useState<SessionRow[]>(initialSessionRows)
  const [isRecentSessionsLoading, setIsRecentSessionsLoading] = useState(false)
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<string | null>(null)
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({})

  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [isOrganizationLoading, setIsOrganizationLoading] = useState(false)

  const [dashboardHourlyRisk, setDashboardHourlyRisk] = useState<MonitoringHourlyRisk24hResponse | null>(null)
  const [isDashboardHourlyLoading, setIsDashboardHourlyLoading] = useState(false)

  const [statType, setStatType] = useState<'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('hourly')
  const [statStartDate, setStatStartDate] = useState(weekAgoStr)
  const [statEndDate, setStatEndDate] = useState(todayStr)
  const [analysisStats, setAnalysisStats] = useState<OrganizationRiskStatsResponse | null>(null)
  const [isAnalysisStatsLoading, setIsAnalysisStatsLoading] = useState(false)

  const [membersQuery, setMembersQuery] = useState('')
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMemberResponse[]>([])
  const [isMembersLoading, setIsMembersLoading] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
  
  const [email, setEmail] = useState('')
  
  const [showAddMember, setShowAddMember] = useState(false)

  const [alertFilterStartDate, setAlertFilterStartDate] = useState(weekAgoStr)
  const [alertFilterEndDate, setAlertFilterEndDate] = useState(todayStr)
  const [alertFilterLevel, setAlertFilterLevel] = useState<'all' | 'L1' | 'L2'>('all')

  const [realtimeSummary, setRealtimeSummary] = useState<RealtimeSummaryResponse | null>(null)
  const realtimeSummaryRef = useRef<RealtimeSummaryResponse | null>(null)
  const isRealtimeRiskUsersSyncInFlightRef = useRef(false)
  const isRealtimeTab = activeTab === 'dashboard' || activeTab === 'live' || activeTab === 'alerts'

  useEffect(() => {
    realtimeSummaryRef.current = realtimeSummary
  }, [realtimeSummary])

  useEffect(() => {
    if (!isLoggedIn || !isRealtimeTab) {
      return
    }

    let isCancelled = false
    let abortController: AbortController | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const waitBeforeRetry = (delayMs: number) =>
      new Promise<void>((resolve) => {
        retryTimer = setTimeout(resolve, delayMs)
      })

    const connect = async () => {
      while (!isCancelled) {
        try {
          let accessToken = getAccessToken()
          if (!accessToken) {
            const refreshed = await ensureWebSession()
            if (!refreshed || isCancelled) {
              break
            }
            accessToken = getAccessToken()
            if (!accessToken) {
              break
            }
          }

          abortController = new AbortController()
          await streamRealtimeSummary({
            accessToken,
            signal: abortController.signal,
            onSummary: (summary) => {
              if (isCancelled) {
                return
              }

              const previousSummary = realtimeSummaryRef.current
              if (isRealtimeSummaryEqual(previousSummary, summary)) {
                return
              }

              setRealtimeSummary(summary)
              realtimeSummaryRef.current = summary

              const activeSessionCountChanged =
                previousSummary === null
                || previousSummary.activeSessionCount !== summary.activeSessionCount

              if (
                !activeSessionCountChanged
                || activeTab !== 'live'
                || !organizationId
                || isRealtimeRiskUsersSyncInFlightRef.current
              ) {
                return
              }

              isRealtimeRiskUsersSyncInFlightRef.current = true
              void fetchOrganizationRiskUsers(organizationId)
                .then((response) => {
                  if (!isCancelled) {
                    setRiskUsersState(mapRiskUsersResponseToWidgetRows(response))
                  }
                })
                .catch((error: unknown) => {
                  if (!isCancelled) {
                    console.error('Failed to sync realtime monitoring list:', error)
                  }
                })
                .finally(() => {
                  isRealtimeRiskUsersSyncInFlightRef.current = false
                })
            },
            onAlert: (notification) => {
              if (isCancelled) {
                return
              }
              setAlertItems((prev) => applyRealtimeNotification(prev, notification))
            },
          })
        } catch (error) {
          const isAbortError = error instanceof DOMException && error.name === 'AbortError'
          if (isAbortError || isCancelled) {
            break
          }

          if (error instanceof Error && error.message === 'SSE_UNAUTHORIZED') {
            const refreshed = await ensureWebSession()
            if (!refreshed) {
              clearAccessToken()
              setRealtimeSummary(null)
              setIsLoggedIn(false)
              break
            }
          }
        }

        if (isCancelled) {
          break
        }
        await waitBeforeRetry(1500)
      }
    }

    const handlePageHide = () => {
      abortController?.abort()
    }

    window.addEventListener('pagehide', handlePageHide)
    connect()

    return () => {
      isCancelled = true
      if (retryTimer) {
        clearTimeout(retryTimer)
      }
      abortController?.abort()
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [isLoggedIn, isRealtimeTab, activeTab, organizationId])

  useEffect(() => {
    if (!isLoggedIn) {
      setAlertItems([])
      setNotificationsNextCursor(null)
      setHasMoreNotifications(false)
      return
    }

    let isMounted = true

    const loadInitialNotifications = async () => {
      setIsNotificationsLoading(true)
      try {
        const page = await fetchDashboardNotifications({ limit: NOTIFICATION_PAGE_SIZE })
        if (!isMounted) {
          return
        }
        const mapped = page.items.map((item) => mapNotificationToAlertItem(item, '종료됨'))
        setAlertItems((prev) => mergeAlertItems(prev, mapped))
        setNotificationsNextCursor(page.nextCursor)
        setHasMoreNotifications(page.hasNext)
      } catch (error: unknown) {
        if (isMounted) {
          toast.error(extractApiErrorMessage(error, '알림 목록을 불러오지 못했습니다.'))
        }
      } finally {
        if (isMounted) {
          setIsNotificationsLoading(false)
        }
      }
    }

    loadInitialNotifications()
    return () => {
      isMounted = false
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'alerts') {
      return
    }

    let isMounted = true

    const refreshNotificationsOnAlertsTab = async () => {
      setIsNotificationsLoading(true)
      try {
        const page = await fetchDashboardNotifications({ limit: NOTIFICATION_PAGE_SIZE })
        if (!isMounted) {
          return
        }
        const mapped = page.items.map((item) => mapNotificationToAlertItem(item, '종료됨'))
        setAlertItems((prev) => mergeAlertItems(prev, mapped))
        setNotificationsNextCursor(page.nextCursor)
        setHasMoreNotifications(page.hasNext)
      } catch (error: unknown) {
        if (isMounted) {
          toast.error(extractApiErrorMessage(error, '알림 목록을 불러오지 못했습니다.'))
        }
      } finally {
        if (isMounted) {
          setIsNotificationsLoading(false)
        }
      }
    }

    refreshNotificationsOnAlertsTab()
    return () => {
      isMounted = false
    }
  }, [isLoggedIn, activeTab])

  const handleLoadMoreNotifications = async () => {
    if (!notificationsNextCursor || isLoadingMoreNotifications) {
      return
    }

    setIsLoadingMoreNotifications(true)
    try {
      const page = await fetchDashboardNotifications({
        limit: NOTIFICATION_PAGE_SIZE,
        cursor: notificationsNextCursor,
      })
      const mapped = page.items.map((item) => mapNotificationToAlertItem(item, '종료됨'))
      setAlertItems((prev) => mergeAlertItems(prev, mapped))
      setNotificationsNextCursor(page.nextCursor)
      setHasMoreNotifications(page.hasNext)
    } catch (error: unknown) {
      toast.error(extractApiErrorMessage(error, '추가 알림을 불러오지 못했습니다.'))
    } finally {
      setIsLoadingMoreNotifications(false)
    }
  }

  const handleExport = () => {
    const csvContent = "\uFEFFDate,Time,User,Level,Note\n"
      + alertItems.map(a => `${a.date},${a.time},${a.user},${a.level},${a.note}`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "alerts_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    if (!isLoggedIn) {
      setOrganizationId(null)
      setDashboardHourlyRisk(null)
      setAnalysisStats(null)
      setOrganizationMembers([])
      setRiskUsersState(initialRiskUsers)
      setAlertItems([])
      setNotificationsNextCursor(null)
      setHasMoreNotifications(false)
      setSessionRows(initialSessionRows)
      return
    }

    let isMounted = true
    const loadOrganizationId = async () => {
      setIsOrganizationLoading(true)
      try {
        const resolvedOrganizationId = await fetchMyOrganizationId()
        if (!isMounted) {
          return
        }
        setOrganizationId(resolvedOrganizationId)
      } catch (error: unknown) {
        console.error('Failed to resolve organization id:', error)
        if (!isMounted) {
          return
        }
        setOrganizationId(null)
        toast.error(extractApiErrorMessage(error, '조직 정보를 불러오지 못했습니다.'))
      } finally {
        if (isMounted) {
          setIsOrganizationLoading(false)
        }
      }
    }

    loadOrganizationId()
    return () => {
      isMounted = false
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    let isMounted = true
    let intervalId: ReturnType<typeof setInterval> | null = null

    const loadDashboardHourlyRisk = async () => {
      setIsDashboardHourlyLoading(true)
      try {
        const response = await fetchDashboardHourlyRisk24h()
        if (isMounted) {
          setDashboardHourlyRisk(response)
        }
      } catch (error: unknown) {
        console.error('Failed to fetch dashboard hourly risk:', error)
        if (isMounted && activeTab === 'dashboard') {
          toast.error(extractApiErrorMessage(error, '대시보드 시간대 통계를 불러오지 못했습니다.'))
        }
      } finally {
        if (isMounted) {
          setIsDashboardHourlyLoading(false)
        }
      }
    }

    loadDashboardHourlyRisk()
    if (activeTab === 'dashboard') {
      intervalId = setInterval(loadDashboardHourlyRisk, 60000)
    }

    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isLoggedIn, activeTab])

  useEffect(() => {
    if (!isLoggedIn || !organizationId) {
      return
    }

    let isMounted = true
    let intervalId: ReturnType<typeof setInterval> | null = null

    const loadRiskUsers = async () => {
      setIsRiskUsersLoading(true)
      try {
        const response = await fetchOrganizationRiskUsers(organizationId)
        if (isMounted) {
          setRiskUsersState(mapRiskUsersResponseToWidgetRows(response))
        }
      } catch (error: unknown) {
        console.error('Failed to fetch organization risk users:', error)
        if (isMounted && (activeTab === 'dashboard' || activeTab === 'live')) {
          toast.error(extractApiErrorMessage(error, '위험 사용자 목록을 불러오지 못했습니다.'))
        }
      } finally {
        if (isMounted) {
          setIsRiskUsersLoading(false)
        }
      }
    }

    loadRiskUsers()
    if (activeTab === 'dashboard') {
      intervalId = setInterval(loadRiskUsers, 60000)
    }

    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isLoggedIn, organizationId, activeTab])

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    let isMounted = true
    let intervalId: ReturnType<typeof setInterval> | null = null

    const loadRecentEndedSessions = async () => {
      setIsRecentSessionsLoading(true)
      try {
        const response = await fetchDashboardRecentEndedSessions(50)
        if (isMounted) {
          setSessionRows(mapRecentEndedSessionsToRows(response))
        }
      } catch (error: unknown) {
        console.error('Failed to fetch recent ended sessions:', error)
        if (isMounted && (activeTab === 'dashboard' || activeTab === 'live')) {
          toast.error(extractApiErrorMessage(error, '최근 접속 세션을 불러오지 못했습니다.'))
        }
      } finally {
        if (isMounted) {
          setIsRecentSessionsLoading(false)
        }
      }
    }

    loadRecentEndedSessions()
    if (activeTab === 'dashboard') {
      intervalId = setInterval(loadRecentEndedSessions, 60000)
    }

    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isLoggedIn, activeTab])

  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'statistics') {
      return
    }
    if (!organizationId) {
      return
    }
    if (statStartDate > statEndDate) {
      setAnalysisStats(null)
      return
    }

    let isMounted = true
    const loadAnalysisStats = async () => {
      setIsAnalysisStatsLoading(true)
      try {
        const response = await fetchOrganizationRiskStats(organizationId, {
          granularity: statTypeToGranularity[statType],
          from: statStartDate,
          to: statEndDate,
        })
        if (isMounted) {
          setAnalysisStats(response)
        }
      } catch (error: unknown) {
        console.error('Failed to fetch analysis stats:', error)
        if (isMounted) {
          setAnalysisStats(null)
          toast.error(extractApiErrorMessage(error, '분석 통계를 불러오지 못했습니다.'))
        }
      } finally {
        if (isMounted) {
          setIsAnalysisStatsLoading(false)
        }
      }
    }

    loadAnalysisStats()
    return () => {
      isMounted = false
    }
  }, [isLoggedIn, activeTab, organizationId, statType, statStartDate, statEndDate])

  useEffect(() => {
    if (!isLoggedIn || (activeTab !== 'members' && activeTab !== 'account')) {
      return
    }

    let isMounted = true

    const loadMembers = async () => {
      setIsMembersLoading(true)
      try {
        const response = await fetchOrganizationMembers()
        if (isMounted) {
          setOrganizationMembers(response)
        }
      } catch (error: unknown) {
        console.error('Failed to fetch organization members:', error)
        if (isMounted) {
          setOrganizationMembers([])
          toast.error(extractApiErrorMessage(error, '구성원 목록을 불러오지 못했습니다.'))
        }
      } finally {
        if (isMounted) {
          setIsMembersLoading(false)
        }
      }
    }

    loadMembers()
    return () => {
      isMounted = false
    }
  }, [isLoggedIn, activeTab])

  const dashboardHourlyChartData = (dashboardHourlyRisk?.buckets ?? []).map((bucket) => ({
    label: formatHourLabel(bucket.bucketStart),
    value: bucket.totalRiskCount,
  }))

  const dashboardPeakRiskHour = dashboardHourlyChartData.reduce(
    (best, current) => (current.value > best.value ? current : best),
    { label: '-', value: 0 }
  )
  const dashboardTotalRiskCount = dashboardHourlyChartData.reduce((sum, row) => sum + row.value, 0)

  const analysisSeries = analysisStats?.series ?? []
  const totalSessions = analysisSeries.reduce((sum, row) => sum + row.sessionCount, 0)
  const totalDrowsy = analysisSeries.reduce((sum, row) => sum + row.drowsyCount, 0)
  const totalSleep = analysisSeries.reduce((sum, row) => sum + row.sleepCount, 0)
  const totalRisk = analysisSeries.reduce((sum, row) => sum + row.totalRiskCount, 0)

  const analysisChartData = analysisSeries.map((row) => ({
    xKey: row.bucketStart,
    axisLabel: formatBucketTickLabel(row.bucketStart, row.bucketEnd, statType),
    label: formatBucketLabel(row.bucketStart, row.bucketEnd, statType),
    l1: row.drowsyCount,
    l2: row.sleepCount,
    total: row.totalRiskCount,
  }))

  const analysisTop5Members = analysisStats?.top5Members ?? []

  const applyStatTypePreset = (type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setStatType(type)
    const today = new Date()
    const end = toInputDateString(today)

    if (type === 'hourly') {
      setStatStartDate(toInputDateString(getDateBefore(today, 2)))
      setStatEndDate(end)
      return
    }
    if (type === 'daily') {
      setStatStartDate(toInputDateString(getDateBefore(today, 14)))
      setStatEndDate(end)
      return
    }
    if (type === 'weekly') {
      setStatStartDate(toInputDateString(getDateBefore(today, 56)))
      setStatEndDate(end)
      return
    }
    if (type === 'monthly') {
      setStatStartDate(toInputDateString(getDateBefore(today, 180)))
      setStatEndDate(end)
      return
    }

    setStatStartDate(toInputDateString(getDateBefore(today, 365 * 2)))
    setStatEndDate(end)
  }

  const normalizedMembersQuery = membersQuery.trim().toLowerCase()
  const filteredMembers = organizationMembers.filter((member) => {
    if (!normalizedMembersQuery) {
      return true
    }
    const keywords = [member.name, member.email, member.nickname]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLowerCase())
    return keywords.some((value) => value.includes(normalizedMembersQuery))
  })

  const activeRealtimeAlerts = alertItems.filter((item) => item.status === '진행중')
  const activeAlertCount = activeRealtimeAlerts.length
  const activeL1AlertCount = activeRealtimeAlerts.filter((item) => item.level === 'L1').length
  const activeL2AlertCount = activeRealtimeAlerts.filter((item) => item.level === 'L2').length
  const filteredAlertItems = alertItems.filter((item) => {
    const occurredAtDate = parseDateLike(item.date)
    const startDate = parseDateLike(alertFilterStartDate)
    const endDate = parseDateLike(alertFilterEndDate)
    if (!occurredAtDate || !startDate || !endDate) {
      return false
    }

    const occurredAt = occurredAtDate.getTime()
    const start = startDate.getTime()
    const end = endDate.getTime()

    if (Number.isNaN(occurredAt) || occurredAt < start || occurredAt > end) {
      return false
    }
    if (alertFilterLevel !== 'all' && item.level !== alertFilterLevel) {
      return false
    }
    return true
  })

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      return
    }

    setIsAddingMember(true)
    try {
      const createdMember = await addOrganizationMember(normalizedEmail)
      setOrganizationMembers((prev) => [
        createdMember,
        ...prev.filter((member) => member.memberId !== createdMember.memberId),
      ])
      toast.success('구성원을 추가했습니다.')
      setShowAddMember(false)
      setEmail('')
    } catch (error: unknown) {
      console.error('Failed to add organization member:', error)
      toast.error(extractApiErrorMessage(error, '구성원 추가에 실패했습니다.'))
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleRemoveMember = async (member: OrganizationMemberResponse) => {
    const memberName = member.name ?? member.email ?? member.userId
    if (!confirm(`정말 ${memberName} 구성원을 삭제하시겠습니까?`)) {
      return
    }

    setRemovingMemberId(member.memberId)
    try {
      await removeOrganizationMember(member.memberId)
      setOrganizationMembers((prev) => prev.filter((item) => item.memberId !== member.memberId))
      toast.success('구성원을 삭제했습니다.')
    } catch (error: unknown) {
      console.error('Failed to remove organization member:', error)
      toast.error(extractApiErrorMessage(error, '구성원 삭제에 실패했습니다.'))
    } finally {
      setRemovingMemberId(null)
    }
  }

  if (isAuthInitializing) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="w-full max-w-sm p-8 bg-white border border-slate-200 rounded-3xl shadow-xl text-center">
          <p className="text-sm font-bold text-slate-500">세션 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col items-center">
          <div className="grid w-16 h-16 place-items-center bg-slate-900 rounded-2xl text-white mb-6 shadow-md">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Eye:on Admin</h1>
          <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Secure Access Portal</p>
          
          <div className="flex w-full bg-slate-100 rounded-xl p-1 mb-8 mt-6">
            <button type="button" className="flex-1 py-2 text-sm font-bold rounded-lg transition-all bg-white text-slate-900 shadow-sm">로그인</button>
            <button type="button" onClick={() => window.location.href = '/signup'} className="flex-1 py-2 text-sm font-bold rounded-lg transition-all text-slate-500 hover:text-slate-900">회원가입</button>
          </div>
          
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <input type="email" placeholder="이메일" value={operatorCode || ''} onChange={e => setOperatorCode(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 transition-colors" required />
            <input type="password" placeholder="비밀번호" value={password || ''} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 transition-colors" required />
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 mt-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:-translate-y-0.5 transition-all disabled:bg-slate-300"
            >
              {isLoading ? '연결 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] min-h-screen bg-slate-50">
      <Toaster position="top-right" />
      {/* Sidebar - Dark Figma Theme */}
      <aside className="flex flex-col h-auto md:sticky md:top-0 md:h-screen p-4 xl:p-6 bg-slate-950 text-slate-300 border-b md:border-b-0 md:border-r border-slate-800 z-10 overflow-y-auto">
        <div className="flex items-center gap-3 pb-6 mb-2 border-b border-slate-800">
          <div className="grid w-10 h-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.3)]">
            <ShieldAlert size={22} />
          </div>
          <div className="min-w-0">
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
              <item.icon size={20} className="shrink-0" strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          {subscription && (
            <div className={`mx-4 px-3 py-2 rounded-xl border flex items-center justify-between shadow-sm ${
              subscription.plan === 'PRO' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
              subscription.plan === 'PLUS' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
              'bg-slate-500/10 border-slate-500/20 text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                {subscription.plan === 'PRO' ? <Zap size={14} className="shrink-0 fill-purple-400" /> : 
                 subscription.plan === 'PLUS' ? <Sparkles size={14} className="shrink-0" /> : 
                 <ShieldAlert size={14} className="shrink-0" />}
                <span className="truncate text-[10px] font-black uppercase tracking-wider">{subscription.plan} Plan</span>
              </div>
              <span className="text-[10px] font-bold opacity-60">Active</span>
            </div>
          )}

          <button onClick={() => setActiveTab('account')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-medium text-left border border-slate-800 ${activeTab === 'account' ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-900 hover:bg-white/5 hover:text-slate-100'}`}>
            <div className="grid w-8 h-8 shrink-0 place-items-center rounded-lg bg-slate-800 text-slate-300">
              <UserCircle size={18} />
            </div>
            <div className="min-w-0">
              <span className="block text-sm text-slate-100 font-bold leading-none truncate">관리자</span>
              <span className="block text-xs text-slate-500 truncate">admin@eyeon.com</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Workspace - Light Figma Theme */}
      <main className="min-w-0 p-4 md:p-6 xl:p-8 overflow-y-auto text-slate-900 min-h-screen md:h-screen max-w-[1600px] mx-auto w-full">
        {activeTab === 'dashboard' && (
          <>
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 m-0 mb-1">대시보드</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DashboardClockBadge />
                <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-bold shadow-sm transition-colors ${isEditMode ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  {isEditMode ? <><Check size={16} /> 편집 완료</> : <><SquarePen size={16} /> 위젯 편집</>}
                </button>
                <button onClick={resetDashboard} className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                  <RotateCcw size={16} /> 위젯 초기화
                </button>
              </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
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

              {(() => {
                const alertCount = realtimeSummary?.warningSessionCount ?? activeAlertCount;
                const l1Count = realtimeSummary?.drowsyWarningSessionCount ?? activeL1AlertCount;
                const l2Count = realtimeSummary?.sleepWarningSessionCount ?? activeL2AlertCount;
                const hasAlerts = alertCount > 0;
                
                return (
                  <div className={`w-full lg:w-[320px] xl:w-[400px] p-5 rounded-2xl shadow-sm flex flex-col justify-center relative overflow-hidden transition-all ${hasAlerts ? 'bg-red-600 border border-red-700 text-white shadow-red-500/30' : 'bg-slate-50 border border-slate-200 text-slate-400'}`}>
                    {hasAlerts && (
                      <div className="absolute -right-4 -top-4 opacity-10">
                        <ShieldAlert size={120} />
                      </div>
                    )}
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        {hasAlerts ? (
                          <span className="flex w-3 h-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                          </span>
                        ) : (
                          <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                        )}
                        <h2 className={`text-sm font-black m-0 tracking-wider ${hasAlerts ? 'text-white' : 'text-slate-500'}`}>실시간 세션 경고</h2>
                      </div>
                      <div className="flex items-end gap-3">
                        <div className={`text-5xl font-black ${hasAlerts ? 'text-white' : 'text-slate-300'}`}>{alertCount}</div>
                        <div className={`text-sm font-bold pb-1 ${hasAlerts ? 'opacity-90' : 'opacity-50'}`}>진행중</div>
                      </div>
                      {hasAlerts && (
                        <div className="flex gap-4 mt-4 pt-4 border-t border-red-500/50">
                          <div className="flex items-center gap-2 text-sm font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-300"></span> 졸음 {l1Count}건
                          </div>
                          <div className="flex items-center gap-2 text-sm font-bold">
                            <span className="w-2 h-2 rounded-full bg-rose-300"></span> 수면 {l2Count}건
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>

            <ResponsiveGridLayout
              className={`min-h-[400px] ${isEditMode ? 'is-editing' : ''}`}
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={30}
              onLayoutChange={isEditMode ? handleLayoutChange : undefined}
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
                      const total = realtimeSummary?.totalMemberCount ?? riskUsersState.length;
                      const active = realtimeSummary?.activeSessionCount ?? riskUsersState.filter(u => u.isOnline).length;
                      const alerting = realtimeSummary?.warningSessionCount ?? activeAlertCount;
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
                        {isRiskUsersLoading ? (
                          <div className="h-full min-h-[150px] grid place-items-center text-sm font-bold text-slate-400">
                            위험 사용자 정보를 불러오는 중...
                          </div>
                        ) : riskUsersState.length > 0 ? (
                          riskUsersState.slice(0, 5).map(u => (
                            <button key={u.name} onClick={() => setSelectedUserForDetail(u.name)} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all text-left w-full">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${u.alertCount >= 5 ? 'bg-red-500' : u.alertCount >= 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                <div>
                                  <strong className="block text-sm font-bold text-slate-900 leading-none mb-1">{u.name}</strong>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Alerts</span>
                                <strong className={`text-sm font-black ${u.alertCount > 0 ? 'text-red-500' : 'text-slate-500'}`}>{u.alertCount}</strong>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="h-full min-h-[150px] grid place-items-center text-sm font-bold text-slate-400">
                            조회된 위험 사용자가 없습니다.
                          </div>
                        )}
                      </div>
                    )}
                    {id === 'alertFeed' && (
                      <div className="flex flex-col gap-3">
                        {alertItems.length > 0 ? alertItems.slice(0, 4).map((a, i) => (
                          <div key={a.notificationId ?? `${a.user}-${a.date}-${a.time}-${i}`} className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
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
                        )) : (
                          <div className="h-full min-h-[150px] grid place-items-center text-sm font-bold text-slate-400">
                            최근 알림이 없습니다.
                          </div>
                        )}
                      </div>
                    )}
                    {id === 'hourlyTrend' && (
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-slate-500">피크 시간: {dashboardPeakRiskHour.label}</span>
                          <span className="text-xs font-bold text-slate-500">누적: {dashboardTotalRiskCount}건</span>
                        </div>
                        <div className="flex-1 min-h-[150px] relative w-full h-full">
                          {isDashboardHourlyLoading ? (
                            <div className="h-full min-h-[150px] grid place-items-center text-sm font-bold text-slate-400">
                              시간대 통계를 불러오는 중...
                            </div>
                          ) : dashboardHourlyChartData.length > 0 ? (
                            <ResponsiveContainer width="99%" height="100%" minHeight={150}>
                              <LineChart data={dashboardHourlyChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full min-h-[150px] grid place-items-center text-sm font-bold text-slate-400">
                              표시할 시간대 통계가 없습니다.
                            </div>
                          )}
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
                            {isRecentSessionsLoading ? (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500 font-bold">
                                  최근 접속 세션을 불러오는 중입니다...
                                </td>
                              </tr>
                            ) : sessionRows.length > 0 ? (
                              sessionRows.slice(0, 5).map((s, i) => (
                                <tr key={i} className="border-b border-slate-50 last:border-0">
                                  <td className="p-3"><div className={`w-2 h-2 rounded-full ${s.alerts === '정상' ? 'bg-emerald-500' : 'bg-red-500'}`}></div></td>
                                  <td className="p-3 font-bold text-slate-900">{s.user}</td>
                                  <td className="p-3 text-slate-500">{s.startTime}</td>
                                  <td className="p-3 text-slate-500">{s.duration}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500 font-bold">
                                  종료된 접속 세션이 없습니다.
                                </td>
                              </tr>
                            )}
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
              <SummaryCard 
                icon={Activity} 
                label="현재 모니터링 인원" 
                value={realtimeSummary?.activeSessionCount.toString() ?? riskUsersState.filter(u => u.isOnline).length.toString()} 
                detail={`전체 구성원 ${realtimeSummary?.totalMemberCount ?? riskUsersState.length}명 중 모니터링 활성화 상태`} 
              />
              <SummaryCard 
                icon={BellRing} 
                label="실시간 경고 (진행중)" 
                value={realtimeSummary?.warningSessionCount.toString() ?? activeAlertCount.toString()} 
                detail={`졸음 ${realtimeSummary?.drowsyWarningSessionCount ?? 0}건 / 수면 ${realtimeSummary?.sleepWarningSessionCount ?? 0}건`} 
              />
            </div>

            {(() => {
              const activeAlerts = activeRealtimeAlerts;
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
                  <input type="text" placeholder="이름, 이메일 검색" value={membersQuery} onChange={e => setMembersQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm font-medium" />
                </div>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 whitespace-nowrap">
                  총 {organizationMembers.length}명
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-4 font-bold border-b border-slate-100 rounded-tl-xl">이름</th>
                      <th className="p-4 font-bold border-b border-slate-100">이메일</th>
                      <th className="p-4 font-bold border-b border-slate-100">역할</th>
                      <th className="p-4 font-bold border-b border-slate-100">가입일</th>
                      <th className="p-4 font-bold border-b border-slate-100 rounded-tr-xl">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isMembersLoading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                          구성원 목록을 불러오는 중입니다...
                        </td>
                      </tr>
                    ) : filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                          조회된 구성원이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => (
                        <tr key={member.memberId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{member.name ?? member.nickname ?? '-'}</td>
                          <td className="p-4 text-slate-600">{member.email ?? '-'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg border ${member.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {formatMemberRole(member.role)}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 whitespace-nowrap">{formatMemberCreatedAt(member.createdAt)}</td>
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member)}
                              disabled={removingMemberId === member.memberId}
                              className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {removingMemberId === member.memberId ? '삭제 중...' : '삭제'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
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
                    <tr><th className="p-4 font-bold border-b border-slate-100">일시</th><th className="p-4 font-bold border-b border-slate-100">사용자</th><th className="p-4 font-bold border-b border-slate-100">단계</th><th className="p-4 font-bold border-b border-slate-100">내용</th></tr>
                  </thead>
                  <tbody>
                    {filteredAlertItems.map((item, i) => (
                      <tr key={item.notificationId ?? `${item.user}-${item.date}-${item.time}-${i}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-slate-600 whitespace-nowrap">{item.date} {item.time}</td>
                        <td className="p-4 font-bold text-slate-900">{item.user}</td>
                        
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider ${item.level === 'L1' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {item.level === 'L1' ? '졸음' : '수면'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{item.note}</td>
                      </tr>
                    ))}
                    {isNotificationsLoading && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 font-bold">
                          알림 목록을 불러오는 중입니다...
                        </td>
                      </tr>
                    )}
                    {!isNotificationsLoading && filteredAlertItems.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 font-bold">
                          조건에 맞는 알림이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {(hasMoreNotifications || isLoadingMoreNotifications) && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMoreNotifications}
                    disabled={isLoadingMoreNotifications}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMoreNotifications ? '불러오는 중...' : '이전 알림 더 보기'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
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
                    onClick={() => applyStatTypePreset(type as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly')}
                  >
                    {type === 'hourly' ? '시간대' : type === 'daily' ? '일' : type === 'weekly' ? '주' : type === 'monthly' ? '월' : '년'}
                  </button>
                ))}
                <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                <input type="date" value={statStartDate} onChange={e => setStatStartDate(e.target.value)} className="px-2 py-1 bg-transparent text-sm font-bold text-slate-600 outline-none" />
                <span className="text-slate-400">~</span>
                <input type="date" value={statEndDate} onChange={e => setStatEndDate(e.target.value)} className="px-2 py-1 bg-transparent text-sm font-bold text-slate-600 outline-none" />
              </div>
            </header>

            {statStartDate > statEndDate ? (
              <div className="p-8 text-center text-red-500 bg-white border border-red-100 rounded-2xl shadow-sm font-bold">
                시작일은 종료일보다 이후일 수 없습니다.
              </div>
            ) : isOrganizationLoading ? (
              <div className="p-8 text-center text-slate-500 bg-white border border-slate-100 rounded-2xl shadow-sm font-bold">
                조직 정보를 불러오는 중입니다...
              </div>
            ) : !organizationId ? (
              <div className="p-8 text-center text-slate-500 bg-white border border-slate-100 rounded-2xl shadow-sm font-bold">
                조직 식별 정보를 확인할 수 없습니다.
              </div>
            ) : isAnalysisStatsLoading ? (
              <div className="p-8 text-center text-slate-500 bg-white border border-slate-100 rounded-2xl shadow-sm font-bold">
                분석 통계를 불러오는 중입니다...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-sm font-bold text-slate-500 mb-2">해당 기간 총 세션</p>
                    <p className="text-3xl font-black text-slate-900 m-0">{totalSessions}</p>
                  </div>
                  <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-sm font-bold text-slate-500 mb-2">졸음</p>
                    <p className="text-3xl font-black text-amber-500 m-0">{totalDrowsy}</p>
                  </div>
                  <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-sm font-bold text-slate-500 mb-2">수면</p>
                    <p className="text-3xl font-black text-red-500 m-0">{totalSleep}</p>
                  </div>
                  <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-sm font-bold text-slate-500 mb-2">전체 발생 알림</p>
                    <p className="text-3xl font-black text-slate-900 m-0">{totalRisk}</p>
                  </div>
                </div>

                {analysisChartData.length > 0 ? (
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
                          <LineChart data={analysisChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                              dataKey="xKey"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                              dy={10}
                              tickFormatter={(_value, index) => analysisChartData[index]?.axisLabel ?? ''}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                            <Tooltip
                              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                              labelFormatter={(_value, payload) => {
                                if (!payload || payload.length === 0) {
                                  return '-'
                                }
                                return payload[0]?.payload?.label ?? '-'
                              }}
                            />
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
                              <tr>
                                <th className="p-3 font-bold border-b border-slate-100">기준</th>
                                <th className="p-3 font-bold border-b border-slate-100">세션</th>
                                <th className="p-3 font-bold border-b border-slate-100">총 알림</th>
                                <th className="p-3 font-bold border-b border-slate-100">졸음</th>
                                <th className="p-3 font-bold border-b border-slate-100">수면</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analysisSeries.slice(0, 10).map((row) => (
                                <tr key={`${row.bucketStart}_${row.bucketEnd}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                  <td className="p-3 font-bold text-slate-700">{formatBucketLabel(row.bucketStart, row.bucketEnd, statType)}</td>
                                  <td className="p-3 font-black text-slate-900">{row.sessionCount}</td>
                                  <td className="p-3 font-black text-slate-900">{row.totalRiskCount}</td>
                                  <td className="p-3 text-amber-600 font-bold">{row.drowsyCount}</td>
                                  <td className="p-3 text-red-600 font-bold">{row.sleepCount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>

                      <section className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-black text-slate-900 m-0 mb-4">주의가 필요한 사용자 Top 5</h2>
                        {analysisTop5Members.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            {analysisTop5Members.map((member, index) => (
                              <div key={member.userId} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className="grid w-8 h-8 place-items-center rounded-full bg-red-100 text-red-600 font-black text-sm">{index + 1}</div>
                                  <div>
                                    <strong className="block text-sm font-bold text-slate-900">{member.name || `사용자 ${index + 1}`}</strong>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">알림</span>
                                  <strong className="text-base font-black text-red-600 leading-none">{member.totalRiskCount}건</strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center text-slate-400 font-bold bg-slate-50 border border-slate-100 rounded-xl">
                            해당 기간 Top 5 데이터가 없습니다.
                          </div>
                        )}
                      </section>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-slate-500 bg-white border border-slate-100 rounded-2xl shadow-sm font-bold">
                    해당 조건에 맞는 데이터가 없습니다.
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {activeTab === 'account' && (
          <div className="flex flex-col gap-6">
            <header className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 m-0 mb-1">계정 설정</h1>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col gap-6">
                {/* Subscription Management Section */}
                <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-slate-900 m-0">구독 관리</h3>
                  {subscription && (
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      subscription.plan === 'PRO' ? 'bg-purple-100 text-purple-700' :
                      subscription.plan === 'PLUS' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {subscription.plan}
                    </span>
                  )}
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">조직원 사용량</span>
                    <strong className="text-slate-900">{organizationMembers.length} / {subscription?.membersLimit ?? '-'}명</strong>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">데이터 열람 기간</span>
                    <strong className="text-slate-900">{subscription?.retentionPeriod ?? '-'}</strong>
                  </div>
                  {subscription?.plan !== 'FREE' && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">다음 결제 일</span>
                      <strong className="text-slate-900">2026. 06. 28</strong>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">상태</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <Check size={14} strokeWidth={3} /> 활성 상태
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => window.location.href = '/subscription'}
                  className="w-full py-4 rounded-xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> 구독 플랜 변경 및 관리
                </button>
              </div>

                <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-black text-red-600 mb-6">시스템 로그아웃</h3>
                  <p className="text-sm text-slate-500 mb-6">보안을 위해 사용이 끝나면 로그아웃 해주세요.</p>
                  <button type="button" onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold hover:bg-red-100 transition-colors">
                    <LogOut size={18} /> 안전하게 로그아웃
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6">비밀번호 변경</h3>
                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">현재 비밀번호</label>
                    <input
                      type="password"
                      placeholder="현재 비밀번호를 입력하세요"
                      value={accountCurrentPassword}
                      onChange={e => setAccountCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
                      minLength={4}
                      maxLength={72}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">새 비밀번호</label>
                    <input
                      type="password"
                      placeholder="새로운 비밀번호를 입력하세요"
                      value={accountNewPassword}
                      onChange={e => setAccountNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
                      minLength={4}
                      maxLength={72}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">비밀번호 확인</label>
                    <input
                      type="password"
                      placeholder="다시 한번 입력하세요"
                      value={accountNewPasswordConfirm}
                      onChange={e => setAccountNewPasswordConfirm(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
                      minLength={4}
                      maxLength={72}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">조직 코드</label>
                    <input
                      type="text"
                      placeholder="인증을 위한 조직 코드를 입력하세요"
                      value={accountOrganizationCode}
                      onChange={e => setAccountOrganizationCode(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
                      maxLength={100}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full py-3 mt-2 rounded-xl bg-slate-900 text-white font-bold shadow-md hover:-translate-y-0.5 transition-transform disabled:bg-slate-400 disabled:hover:translate-y-0"
                  >
                    {isChangingPassword ? '변경 중...' : '변경 사항 저장'}
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}
      </main>

      {selectedUserForDetail && <UserDetailModal userName={selectedUserForDetail} riskUsers={riskUsersState} alertItems={alertItems} sessionRows={sessionRows} onClose={() => setSelectedUserForDetail(null)} onDelete={() => { setRiskUsersState(prev => prev.filter(u => u.name !== selectedUserForDetail)) }}  />}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-xl">
            <header className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="m-0 text-xl font-black text-slate-900">구성원 추가</h2>
              <button type="button" onClick={() => setShowAddMember(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">닫기</button>
            </header>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-6">새로운 구성원의 이메일을 입력하세요.</p>
              <form onSubmit={handleAddMember} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">이메일</label>
                  <input type="email" placeholder="user@eyeon.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm" required />
                </div>
                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="w-full py-3 mt-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:-translate-y-0.5 transition-transform disabled:bg-slate-300 disabled:shadow-none disabled:transform-none"
                >
                  {isAddingMember ? '추가 중...' : '구성원 추가 완료'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
