import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { LoginResponse } from '../types/api'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let accessToken: string | null = null
let refreshPromise: Promise<string | null> | null = null

const baseHeaders = {
  'Content-Type': 'application/json',
  'X-Client-Type': 'WEB',
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: baseHeaders,
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: baseHeaders,
})

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const clearAccessToken = () => {
  accessToken = null
}

export const getAccessToken = () => accessToken

const performRefreshRequest = async (): Promise<string | null> => {
  try {
    const response = await refreshClient.post<LoginResponse>('/api/auth/refresh')
    const newAccessToken = response.data.accessToken
    setAccessToken(newAccessToken)
    return newAccessToken
  } catch {
    clearAccessToken()
    return null
  }
}

const requestNewAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = performRefreshRequest().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export const ensureWebSession = async (): Promise<boolean> => {
  const newAccessToken = await requestNewAccessToken()
  return Boolean(newAccessToken)
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const requestUrl = originalRequest?.url ?? ''

    const isAuthEndpoint =
      requestUrl.includes('/api/auth/login')
      || requestUrl.includes('/api/auth/signup')
      || requestUrl.includes('/api/auth/refresh')

    if (
      !originalRequest
      || originalRequest._retry
      || error.response?.status !== 401
      || isAuthEndpoint
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    const newAccessToken = await requestNewAccessToken()
    if (!newAccessToken) {
      // Refresh 실패 시 로그인 페이지로 이동하거나 세션 초기화
      window.location.href = '/' 
      return Promise.reject(error)
    }

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
    return apiClient(originalRequest)
  }
)

export default apiClient
