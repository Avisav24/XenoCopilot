export interface CampaignContextData {
  sourcePage?: string;
  objective?: string;
  audienceName?: string;
  audienceSize?: number | string;
  expectedRevenue?: number | string;
  recommendedChannel?: string;
  churnRisk?: string;
  confidence?: number | string;
  recommendedAction?: string;
  autoTriggerPrompt?: string; 
}

const CONTEXT_KEY = 'campaignCopilotContext';

export const setCampaignContext = (data: CampaignContextData) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(data));
  }
};

export const getCampaignContext = (): CampaignContextData | null => {
  if (typeof window !== 'undefined') {
    const data = sessionStorage.getItem(CONTEXT_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse campaign context", e);
        return null;
      }
    }
  }
  return null;
};

export const clearCampaignContext = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(CONTEXT_KEY);
  }
};
