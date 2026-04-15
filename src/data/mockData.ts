import { LayoutDashboard, Radio, Users, BellRing, Activity } from 'lucide-react'
import type { ResponsiveLayouts } from 'react-grid-layout/legacy'
import type { NavigationItem, WidgetId, WidgetMeta, RiskUser, AlertItem, SessionRow } from '../types'

export const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'live', label: '실시간', icon: Radio },
  { id: 'members', label: '구성원', icon: Users },
  { id: 'alerts', label: '알림', icon: BellRing },
  { id: 'statistics', label: '분석', icon: Activity },
]

export const widgetOrder: WidgetId[] = [
  'activeUsers',
  'riskUsers',
  'alertFeed',
  'hourlyTrend',
  'sessionTable',
]

export const widgetMeta: Record<WidgetId, WidgetMeta> = {
  activeUsers: { id: 'activeUsers', title: '실시간 현황' },
  riskUsers: { id: 'riskUsers', title: '위험 사용자 큐' },
  alertFeed: { id: 'alertFeed', title: '실시간 알림' },
  hourlyTrend: { id: 'hourlyTrend', title: '졸음 발생 추이' },
  sessionTable: { id: 'sessionTable', title: '최근 접속 세션' },
}

export const defaultLayouts: ResponsiveLayouts = {
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

export const initialRiskUsers: RiskUser[] = [
  { name: '김민수', team: '운수팀 A', alertCount: 12, sessionsToday: 12 },
  { name: '마동석', team: '운수팀 C', alertCount: 9, sessionsToday: 8 },
  { name: '지석진', team: '업무팀 2', alertCount: 8, sessionsToday: 11 },
  { name: '김태리', team: '운수팀 B', alertCount: 7, sessionsToday: 10 },
  { name: '이소율', team: '운수팀 C', alertCount: 7, sessionsToday: 13 },
  { name: '이광수', team: '업무팀 2', alertCount: 6, sessionsToday: 15 },
  { name: '송혜교', team: '업무팀 1', alertCount: 5, sessionsToday: 9 },
  { name: '박연우', team: '운수팀 B', alertCount: 4, sessionsToday: 14 },
  { name: '정하준', team: '업무팀 1', alertCount: 4, sessionsToday: 10 },
  { name: '최지우', team: '운수팀 A', alertCount: 4, sessionsToday: 11 },
  { name: '한효주', team: '운수팀 B', alertCount: 3, sessionsToday: 12 },
  { name: '송중기', team: '업무팀 1', alertCount: 2, sessionsToday: 10 },
  { name: '김도현', team: '업무팀 2', alertCount: 2, sessionsToday: 11 },
  { name: '이준호', team: '운수팀 A', alertCount: 2, sessionsToday: 12 },
  { name: '유해진', team: '운수팀 C', alertCount: 1, sessionsToday: 13 },
  { name: '손예진', team: '업무팀 1', alertCount: 1, sessionsToday: 10 },
  { name: '공유', team: '운수팀 B', alertCount: 1, sessionsToday: 11 },
  { name: '정우성', team: '운수팀 B', alertCount: 0, sessionsToday: 12 },
  { name: '조진웅', team: '운수팀 C', alertCount: 0, sessionsToday: 10 },
  { name: '현빈', team: '업무팀 1', alertCount: 0, sessionsToday: 11 },
  { name: '박서준', team: '운수팀 A', alertCount: 0, sessionsToday: 12 },
  { name: '최은재', team: '업무팀 2', alertCount: 0, sessionsToday: 10 },
  { name: '강하늘', team: '운수팀 A', alertCount: 0, sessionsToday: 11 },
  { name: '김희애', team: '운수팀 C', alertCount: 0, sessionsToday: 12 },
  { name: '김종국', team: '업무팀 2', alertCount: 0, sessionsToday: 10 },
]

export const { alertItems, sessionRows } = (() => {
  const alerts: AlertItem[] = []
  const sessions: SessionRow[] = []
  let globalAlertIndex = 0

  initialRiskUsers.forEach(user => {
    const userSessions = Array.from({ length: 12 }).map((_, idx) => ({
      user: user.name,
      date: `2026-04-${String(11 - Math.floor(idx/3)).padStart(2, '0')}`,
      startTime: `${String(8 + (idx % 8) * 2).padStart(2, '0')}:15`,
      duration: `${1 + (idx % 3)}h ${10 + (idx * 5) % 45}m`,
      alerts: '정상',
      _l1: 0,
      _l2: 0,
    }))

    for (let i = 0; i < user.alertCount; i++) {
      const sessionIdx = i % 12
      const isL2 = i % 3 === 0
      const session = userSessions[sessionIdx]
      
      if (isL2) session._l2++
      else session._l1++
      
      const level = isL2 ? 'L2' : 'L1'
      const status = globalAlertIndex < 3 ? '진행중' : '종료됨'
      globalAlertIndex++
      
      alerts.push({
        user: user.name,
        team: user.team,
        level,
        date: session.date,
        time: `${String(8 + (sessionIdx % 8) * 2 + 1).padStart(2, '0')}:${String(10 + (i * 7) % 50).padStart(2, '0')}`,
        note: isL2 ? '수면 상태 지속' : '졸음 의심 현상 감지',
        status
      })
    }

    userSessions.forEach(session => {
      if (session._l1 > 0 || session._l2 > 0) {
        const parts = []
        if (session._l1 > 0) parts.push(`졸음 ${session._l1}회`)
        if (session._l2 > 0) parts.push(`수면 ${session._l2}회`)
        session.alerts = parts.join(' / ')
      }
      delete (session as any)._l1
      delete (session as any)._l2
      sessions.push(session as SessionRow)
    })
  })
  
  return { alertItems: alerts, sessionRows: sessions }
})()

export const hourlyTrendData = [
  { label: '00', value: 5 }, { label: '02', value: 3 }, { label: '04', value: 8 }, { label: '06', value: 12 },
  { label: '08', value: 14 }, { label: '10', value: 18 }, { label: '12', value: 31 }, { label: '14', value: 24 },
  { label: '16', value: 39 }, { label: '18', value: 48 }, { label: '20', value: 42 }, { label: '22', value: 33 },
]
