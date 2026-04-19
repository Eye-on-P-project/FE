import apiClient from './client'
import type { OrganizationMemberResponse } from '../types/api'

export const fetchOrganizationMembers = async (): Promise<OrganizationMemberResponse[]> => {
  const response = await apiClient.get<OrganizationMemberResponse[]>('/api/organizations/members')
  return response.data
}

export const addOrganizationMember = async (email: string): Promise<OrganizationMemberResponse> => {
  const response = await apiClient.post<OrganizationMemberResponse>('/api/organizations/members', {
    email,
  })
  return response.data
}

export const removeOrganizationMember = async (memberId: string): Promise<void> => {
  await apiClient.delete(`/api/organizations/members/${memberId}`)
}
