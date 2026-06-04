import apiClient from './client'
import type {
  OrganizationSignupRequest,
  OrganizationSignupReviewResponse,
  OrganizationSignupStatus,
  RejectOrganizationSignupPayload,
} from '../types/admin'

const formatEstablishedAt = (value: string | null | undefined) =>
  value ? value.replaceAll('-', '') : ''

const optionalText = (value: string | null | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const mapSignupReviewResponse = (
  response: OrganizationSignupReviewResponse
): OrganizationSignupRequest => ({
  id: response.organizationId,
  email: response.requesterEmail ?? '',
  status: response.status,
  createdAt: response.createdAt,
  b_no: response.businessmanNum ?? '',
  start_dt: formatEstablishedAt(response.establishedAt),
  p_nm: response.representativeName ?? '대표자 미기재',
  p_nm2: optionalText(response.coRepresentativeName),
  b_nm: optionalText(response.businessName) ?? optionalText(response.organizationName),
  corp_no: optionalText(response.corporateNum),
  b_adr: optionalText(response.businessAddress),
})

export const fetchOrganizationSignupRequests = async (
  params?: { status?: OrganizationSignupStatus; query?: string }
): Promise<OrganizationSignupRequest[]> => {
  const response = await apiClient.get<OrganizationSignupReviewResponse[]>(
    '/api/system-admin/organizations/signups',
    {
      params: {
        status: params?.status,
        query: optionalText(params?.query),
      },
    }
  )
  return response.data.map(mapSignupReviewResponse)
}

export const approveOrganizationSignup = async (organizationId: string): Promise<void> => {
  await apiClient.patch(`/api/system-admin/organizations/signups/${organizationId}/approve`)
}

export const rejectOrganizationSignup = async (
  organizationId: string,
  request: RejectOrganizationSignupPayload
): Promise<void> => {
  await apiClient.patch(`/api/system-admin/organizations/signups/${organizationId}/reject`, request)
}
