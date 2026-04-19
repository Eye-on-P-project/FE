import apiClient, { API_BASE_URL } from './client'
import type {
  MeResponse,
  MonitoringHourlyRisk24hResponse,
  MonitoringNotificationPageResponse,
  MonitoringNotificationResponse,
  MonitoringRecentEndedSessionResponse,
  OrganizationRecordResponse,
  OrganizationRiskStatsResponse,
  OrganizationRiskUserResponse,
  RealtimeSummaryResponse,
  RiskStatsGranularity,
} from '../types/api'

const normalizeCode = (value: string | null | undefined) => (value ?? '').trim().toUpperCase()

export const fetchMyOrganizationId = async (): Promise<string> => {
  const [meResponse, organizationRecordsResponse] = await Promise.all([
    apiClient.get<MeResponse>('/api/users/me'),
    apiClient.get<OrganizationRecordResponse[]>('/api/users/dev/organizations'),
  ])

  const organizationCode = normalizeCode(meResponse.data.organizationCode)
  if (!organizationCode) {
    throw new Error('사용자 organizationCode를 확인할 수 없습니다.')
  }

  const matchedRecord = organizationRecordsResponse.data.find(
    (record) => normalizeCode(record.code) === organizationCode
  )

  if (!matchedRecord) {
    throw new Error(`조직 코드(${organizationCode})에 해당하는 organizationId를 찾지 못했습니다.`)
  }

  return matchedRecord.id
}

export const fetchDashboardHourlyRisk24h = async (): Promise<MonitoringHourlyRisk24hResponse> => {
  const response = await apiClient.get<MonitoringHourlyRisk24hResponse>('/api/monitoring/dashboard/hourly-risk-24h')
  return response.data
}

export const fetchOrganizationRiskStats = async (
  organizationId: string,
  params: { granularity: RiskStatsGranularity; from: string; to: string }
): Promise<OrganizationRiskStatsResponse> => {
  const response = await apiClient.get<OrganizationRiskStatsResponse>(
    `/api/organizations/${organizationId}/analysis/risk-stats`,
    { params }
  )
  return response.data
}

export const fetchOrganizationRiskUsers = async (
  organizationId: string
): Promise<OrganizationRiskUserResponse[]> => {
  const response = await apiClient.get<OrganizationRiskUserResponse[]>(
    `/api/organizations/${organizationId}/risk-users`
  )
  return response.data
}

export const fetchDashboardRecentEndedSessions = async (
  limit = 20
): Promise<MonitoringRecentEndedSessionResponse[]> => {
  const response = await apiClient.get<MonitoringRecentEndedSessionResponse[]>(
    '/api/monitoring/dashboard/recent-ended-sessions',
    { params: { limit } }
  )
  return response.data
}

export const fetchDashboardNotifications = async (
  params?: { limit?: number; cursor?: string | null }
): Promise<MonitoringNotificationPageResponse> => {
  const response = await apiClient.get<MonitoringNotificationPageResponse>(
    '/api/monitoring/dashboard/notifications',
    { params }
  )
  return response.data
}

type RealtimeSummarySseHandlers = {
  accessToken: string
  signal: AbortSignal
  onSummary: (payload: RealtimeSummaryResponse) => void
  onAlert?: (payload: MonitoringNotificationResponse) => void
  onHeartbeat?: () => void
}

type ParsedSseMessage = {
  event: string
  data: string
}

const parseSseMessage = (rawMessage: string): ParsedSseMessage | null => {
  const lines = rawMessage.split('\n')
  let event = 'message'
  const dataLines: string[] = []

  for (const line of lines) {
    if (!line || line.startsWith(':')) {
      continue
    }
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
      continue
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
  }

  if (dataLines.length === 0) {
    return null
  }
  return { event, data: dataLines.join('\n') }
}

export const streamRealtimeSummary = async ({
  accessToken,
  signal,
  onSummary,
  onAlert,
  onHeartbeat,
}: RealtimeSummarySseHandlers): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/monitoring/dashboard/realtime-summary/stream`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${accessToken}`,
    },
    signal,
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('SSE_UNAUTHORIZED')
    }
    throw new Error(`SSE_HTTP_${response.status}`)
  }

  if (!response.body) {
    throw new Error('SSE_STREAM_UNAVAILABLE')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      return
    }

    buffer += decoder.decode(value, { stream: true }).replace(/\r/g, '')

    let boundaryIndex = buffer.indexOf('\n\n')
    while (boundaryIndex >= 0) {
      const rawMessage = buffer.slice(0, boundaryIndex)
      buffer = buffer.slice(boundaryIndex + 2)
      boundaryIndex = buffer.indexOf('\n\n')

      const parsed = parseSseMessage(rawMessage)
      if (!parsed) {
        continue
      }

      if (parsed.event === 'summary') {
        try {
          onSummary(JSON.parse(parsed.data) as RealtimeSummaryResponse)
        } catch {
          // ignore malformed payload
        }
        continue
      }

      if (parsed.event === 'alert') {
        if (onAlert) {
          try {
            onAlert(JSON.parse(parsed.data) as MonitoringNotificationResponse)
          } catch {
            // ignore malformed payload
          }
        }
        continue
      }

      if (parsed.event === 'heartbeat') {
        onHeartbeat?.()
      }
    }
  }
}
