import apiClient from './client'
import type {
  MeResponse,
  MonitoringHourlyRisk24hResponse,
  OrganizationRecordResponse,
  OrganizationRiskStatsResponse,
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
