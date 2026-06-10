// ============================================================
// XenoCopilot — Shared TypeScript Types
// ============================================================

export type Channel = 'email' | 'whatsapp' | 'sms';
export type OrderChannel = 'online' | 'store';
export type CampaignStatus = 'draft' | 'sending' | 'sent' | 'completed';
export type MessageStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'opened'
  | 'read'
  | 'clicked'
  | 'converted';

export type SegmentOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'in';
export type SegmentField =
  | 'last_order_days_ago'
  | 'total_orders'
  | 'total_spend'
  | 'favorite_category'
  | 'preferred_channel'
  | 'discount_affinity';

// ── Customer ──────────────────────────────────────────────
export interface Customer {
  id: string;
  brand_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  preferred_channel?: Channel | null;
  favorite_category?: string | null;
  discount_affinity: boolean;
  preferred_shopping_day?: string | null;
  total_orders: number;
  total_spend: number;
  last_order_at?: string | null;
  created_at: string;
}

// ── Order ─────────────────────────────────────────────────
export interface Order {
  id: string;
  customer_id: string;
  brand_id: string;
  amount: number;
  category?: string | null;
  channel?: OrderChannel | null;
  ordered_at: string;
}

// ── Segment Rules ─────────────────────────────────────────
export interface SegmentRule {
  field: SegmentField;
  operator: SegmentOperator;
  value: string | number | boolean | string[];
}

// ── AI Campaign Plan ──────────────────────────────────────
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

// ── Campaign ──────────────────────────────────────────────
export interface Campaign {
  id: string;
  brand_id: string;
  name: string;
  goal: string;
  ai_plan?: CampaignPlan | null;
  segment_rules?: SegmentRule[] | null;
  status: CampaignStatus;
  audience_count: number;
  created_at: string;
  sent_at?: string | null;
}

// ── Campaign Message ──────────────────────────────────────
export interface CampaignMessage {
  id: string;
  campaign_id: string;
  customer_id: string;
  channel: Channel;
  message_text: string;
  status: MessageStatus;
  sent_at?: string | null;
  delivered_at?: string | null;
  opened_at?: string | null;
  clicked_at?: string | null;
  converted_at?: string | null;
  failed_reason?: string | null;
  created_at: string;
  customer?: Pick<Customer, 'id' | 'name' | 'email' | 'phone' | 'favorite_category'>;
}

// ── API Payloads ──────────────────────────────────────────
export interface PlanCampaignRequest {
  goal: string;
}

export interface PlanCampaignResponse {
  plan: CampaignPlan;
  audience_count: number;
  audience_preview: Customer[];
}

export interface SendCampaignResponse {
  campaign_id: string;
  queued_count: number;
  status: 'sending';
}

export interface ReceiptEvent {
  message_id: string;
  event: 'delivered' | 'failed' | 'opened' | 'clicked' | 'converted';
  timestamp: string;
  reason?: string;
}

// ── Insights ──────────────────────────────────────────────
export interface FunnelStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  failed: number;
  delivery_rate: string;
  open_rate: string;
  click_rate: string;
  conversion_rate: string;
}

export interface ChannelStats {
  channel: Channel;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
}

export interface PersonaStats {
  persona_tag: string;
  sent: number;
  converted: number;
  conversion_rate: string;
}

export interface CampaignInsights {
  campaign_id: string;
  campaign_name: string;
  audience_count: number;
  funnel: FunnelStats;
  by_channel: ChannelStats[];
  by_persona: PersonaStats[];
  estimated_revenue: string;
  top_converting_channel: string;
  ai_summary: string;
}
