// import apiClient from './client'; // TODO: 실제 API 연동 시 주석 해제
import type { SubscriptionPlan, SubscriptionInfo, ChangeSubscriptionRequest, ChangeSubscriptionResponse } from '../types/subscription';

const SUBSCRIPTION_STORAGE_KEY = 'eyeon_subscription';

// Helper to get limits based on plan
export const getPlanDetails = (plan: SubscriptionPlan): Omit<SubscriptionInfo, 'plan' | 'activeUntil'> => {
  switch (plan) {
    case 'PRO':
      return { membersLimit: 200, retentionPeriod: '영구' };
    case 'PLUS':
      return { membersLimit: 50, retentionPeriod: '1달' };
    case 'FREE':
    default:
      return { membersLimit: 5, retentionPeriod: '7일' };
  }
};

/**
 * 현재 사용자의 구독 정보를 가져옵니다.
 */
export const getCurrentSubscription = async (): Promise<SubscriptionInfo> => {
  // TODO: 실제 서버 연동 시 아래 코드를 주석 해제하여 사용합니다.
  /*
  const response = await apiClient.get<SubscriptionInfo>('/api/subscription/me');
  return response.data;
  */

  // -----------------------------------------------------------------
  // [MOCK] 로컬 프론트엔드 테스트를 위한 모의 구현 (실제 배포 시 삭제)
  // -----------------------------------------------------------------
  await new Promise(resolve => setTimeout(resolve, 500)); // Network delay

  const storedPlan = (localStorage.getItem(SUBSCRIPTION_STORAGE_KEY) as SubscriptionPlan) || 'FREE';
  const validPlan = ['FREE', 'PLUS', 'PRO'].includes(storedPlan) ? storedPlan : 'FREE';

  return {
    plan: validPlan,
    ...getPlanDetails(validPlan),
  };
};

/**
 * 사용자의 구독 플랜을 변경(결제)합니다.
 */
export const changeSubscription = async (request: ChangeSubscriptionRequest): Promise<ChangeSubscriptionResponse> => {
  // TODO: 실제 서버 연동 시 아래 코드를 주석 해제하여 사용합니다.
  /*
  const response = await apiClient.post<ChangeSubscriptionResponse>('/api/subscription/change', request);
  return response.data;
  */

  // -----------------------------------------------------------------
  // [MOCK] 로컬 프론트엔드 테스트를 위한 모의 결제 구현 (실제 배포 시 삭제)
  // -----------------------------------------------------------------
  await new Promise(resolve => setTimeout(resolve, 1500)); // Payment processing delay

  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, request.plan);

  return {
    success: true,
    message: `${request.plan} 플랜으로 성공적으로 변경되었습니다.`,
    newPlan: request.plan,
  };
};
