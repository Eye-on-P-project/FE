import apiClient from './client'
import type { ChangePasswordRequest } from '../types/api'

export const changeMyPassword = async (request: ChangePasswordRequest): Promise<void> => {
  await apiClient.patch('/api/users/me/password', request)
}
