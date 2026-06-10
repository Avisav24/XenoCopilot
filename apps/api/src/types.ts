// Local type definitions for the API

export type Channel = 'email' | 'whatsapp' | 'sms';
export type CampaignStatus = 'draft' | 'sending' | 'sent' | 'completed';
export type CommunicationStatus =
  | 'pending' | 'sent' | 'delivered' | 'failed'
  | 'opened' | 'clicked' | 'purchased';

export interface PersonaQueryResponse {
  persona: string;
  count: number;
}

export interface RecommendationResponse {
  channel: Channel;
  expectedRevenue: number;
}

export interface DraftMessageResponse {
  variantA: string;
  variantB: string;
}

export interface AiWorkflowResponse {
  persona: string;
  audience_count: number;
  channel: Channel;
  expected_revenue: number;
  message_variants: {
    variantA: string;
    variantB: string;
  };
}
