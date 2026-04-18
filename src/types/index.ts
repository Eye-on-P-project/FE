import { type LucideIcon } from 'lucide-react'

export type WidgetId =
  | 'activeUsers'
  | 'riskUsers'
  | 'alertFeed'
  | 'hourlyTrend'
  | 'sessionTable'

export type NavigationItem = {
  id: string
  label: string
  icon: LucideIcon
}

export type AlertItem = {
  user: string
  level: 'L1' | 'L2'
  date: string
  time: string
  note: string
  status: '진행중' | '종료됨'
}

export type RiskUser = {
  name: string
  alertCount: number
  sessionsToday: number
  isOnline: boolean
}

export type SessionRow = {
  user: string
  date: string
  startTime: string
  duration: string
  alerts: string
}

export type WidgetMeta = {
  id: WidgetId
  title: string
}
