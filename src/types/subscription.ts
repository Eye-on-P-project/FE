export type SubscriptionPlan = 'FREE' | 'PLUS' | 'PRO';

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  activeUntil?: string; // Optional end date
  membersLimit: number;
  retentionPeriod: string;
}

export interface ChangeSubscriptionRequest {
  plan: SubscriptionPlan;
  paymentMethodId?: string; 
}

export interface ChangeSubscriptionResponse {
  success: boolean;
  message: string;
  newPlan: SubscriptionPlan;
}
