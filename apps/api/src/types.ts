// Local type definitions for the API
// (mirrors packages/shared-types for monorepo compatibility)

export type Channel = 'email' | 'whatsapp' | 'sms';
export type CampaignStatus = 'draft' | 'sending' | 'sent' | 'completed';
export type MessageStatus =
  | 'pending' | 'sent' | 'delivered' | 'failed'
  | 'opened' | 'read' | 'clicked' | 'converted';

export type SegmentOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'in';
export type SegmentField =
  | 'last_order_days_ago' | 'total_orders' | 'total_spend'
  | 'favorite_category' | 'preferred_channel' | 'discount_affinity';

export interface SegmentRule {
  field: SegmentField;
  operator: SegmentOperator;
  value: string | number | boolean | string[];
}

export interface MessageVariant {
  persona_tag: string;
  channel: Channel;
  subject?: string;
  body: string;
}

export interface CampaignPlan {
  segment_rules: SegmentRule[];
  rationale: string;
  message_variants: MessageVariant[];
  recommended_channels: string;
  estimated_audience_description: string;
}
