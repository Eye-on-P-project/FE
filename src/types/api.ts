// Swagger 설명서 기반의 API 데이터 타입 정의

export type UserRole = 'ADMIN' | 'SYSTEM_ADMIN' | 'USER';

export interface LoginResponse {
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  role: UserRole;
}

export interface SignupOrganizationAdminRequest {
  email: string;
  password: string;
  organizationName: string;
  businessmanNum: string;
  establishedAt: string;
  representativeName: string;
  corporateNum: string;
  businessName: string;
  coRepresentativeName?: string;
  businessAddress?: string;
}

export interface SignupResponse {
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole;
}

export interface MeResponse {
  userId: string;
  email: string;
  role: UserRole;
  organizationCode: string;
  name: string;
  nickname: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
}

export interface RealtimeSummaryResponse {
  totalMemberCount: number;
  activeSessionCount: number;
  warningSessionCount: number;
  drowsyWarningSessionCount: number;
  sleepWarningSessionCount: number;
}

export type MonitoringEventType = 'NORMAL' | 'DROWSY' | 'SLEEP';
export type NotificationType = 'NORMAL' | 'DROWSY' | 'SLEEP';

export interface MonitoringEventResponse {
  eventId: string;
  sessionId: string;
  eventType: MonitoringEventType;
  occurredAtApp: string;
  occurredAtServer: string;
  drowsyCount: number;
  sleepCount: number;
}

export interface MonitoringNotificationResponse {
  notificationId: string | null;
  userId: string;
  targetUserId: string;
  userName: string;
  type: NotificationType;
  content: string;
  occurredAt: string;
}

export interface MonitoringNotificationPageResponse {
  items: MonitoringNotificationResponse[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface OrganizationRecordResponse {
  id: string;
  code: string;
  description: string;
  createdAt: string;
}

export interface MonitoringHourlyRiskBucket {
  bucketStart: string;
  bucketEnd: string;
  totalRiskCount: number;
}

export interface MonitoringHourlyRisk24hResponse {
  rangeStart: string;
  rangeEnd: string;
  buckets: MonitoringHourlyRiskBucket[];
}

export type RiskStatsGranularity = 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export interface OrganizationRiskStatsBucket {
  bucketStart: string;
  bucketEnd: string;
  sessionCount: number;
  drowsyCount: number;
  sleepCount: number;
  totalRiskCount: number;
}

export interface OrganizationRiskTopMember {
  userId: string;
  name: string;
  totalRiskCount: number;
}

export interface OrganizationRiskStatsResponse {
  granularity: RiskStatsGranularity;
  from: string;
  to: string;
  series: OrganizationRiskStatsBucket[];
  top5Members: OrganizationRiskTopMember[];
}

export interface OrganizationRiskUserResponse {
  userId: string;
  email: string | null;
  name: string | null;
  nickname: string | null;
  totalSessionCount: number;
  drowsyCount: number;
  sleepCount: number;
  totalRiskCount: number;
  isMonitoringActive: boolean;
}

export interface MonitoringRecentEndedSessionResponse {
  sessionId: string;
  userId: string;
  userName: string | null;
  startedAtApp: string;
  endedAtApp: string | null;
  durationMinutes: number;
  drowsyCount: number;
  sleepCount: number;
  totalRiskCount: number;
}

export interface OrganizationMemberResponse {
  memberId: string;
  organizationId: string;
  userId: string;
  email: string | null;
  name: string | null;
  nickname: string | null;
  role: UserRole | null;
  createdAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  organizationCode: string;
}
