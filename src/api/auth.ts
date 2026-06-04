import apiClient from './client'
import type { SignupOrganizationAdminRequest, SignupResponse } from '../types/api'

export const signupOrganizationAdmin = async (
  request: SignupOrganizationAdminRequest
): Promise<SignupResponse> => {
  const response = await apiClient.post<SignupResponse>('/api/auth/signup', request)
  return response.data
}
