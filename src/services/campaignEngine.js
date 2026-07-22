const STORAGE_KEY = 'loyaltyboost_campaign_workspace_v2';

const DEFAULT_PLAN = {
  id: 'starter-afternoon-rush',
  campaignName: 'Afternoon Espresso Double-Star Rush',
  tagline: 'Double stars. Clear rules. Better afternoons.',
  brandName: 'Starbucks',
  businessGoal: 'Increase weekday afternoon latte sales between 2 PM and 5 PM.',
  targetTiers: ['Silver', 'Gold'],
  status: 'draft',
  pointsMultiplier: 2,
  promoCode: 'LATTERUSH',
  offerType: 'points_multiplier',
  activeWindow: 'Monday-Thursday, 2:00 PM-5:00 PM',
  redemptionMethod: 'Auto-applied when a member scans their loyalty barcode.',
  budgetCap: 12000,
  projectedMarginImpact: 8,
  frequencyCap: '1 redemption per member per day',
  exclusions: ['Delivery marketplace orders', 'Gift card purchases'],
  mechanicsDetail:
    'Earn 2x Stars on espresso, latte, or macchiato purchases made between 2:00 PM and 5:00 PM, Monday through Thursday. Eligible Silver and Gold members receive points automatically after scanning their loyalty barcode. Rewards post within 1 hour.',
  pushNotification:
    "Double Star Rush: Hey {{ user.first_name | default: 'coffee lover' }}, get 2x Stars on lattes from 2-5 PM today.",
  emailSubject:
    "{{ user.first_name | default: 'there' }}, double stars are brewing this afternoon",
  inAppMessage:
    'AFTERNOON STAR BURST\nEarn double points on hand-crafted beverages between 2 PM and 5 PM today. Scan your loyalty barcode at checkout.',
  legalCopy:
    'Valid at participating stores only. Cannot be combined with other offers. Rewards have no cash value.',
  channels: ['Push', 'Email', 'In-app', 'Wallet'],
  assumptions: [
    'Eligible audience is already enrolled in loyalty.',
    'Points liability is capped by the campaign budget.',
    'Offer does not apply to third-party delivery orders.',
  ],
  createdAt: '2026-07-22T00:00:00.000Z',
  updatedAt: '2026-07-22T00:00:00.000Z',
};

export function getDefaultCampaign() {
  return { ...DEFAULT_PLAN, targetTiers: [...DEFAULT_PLAN.targetTiers], channels: [...DEFAULT_PLAN.channels], assumptions: [...DEFAULT_PLAN.assumptions], exclusions: [...DEFAULT_PLAN.exclusions] };
}

export function loadWorkspace() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (saved?.campaigns?.length) return saved;
  } catch {
    safeRemoveWorkspace();
  }

  const starter = getDefaultCampaign();
  const workspace = {
    activeCampaignId: starter.id,
    campaigns: [starter],
  };
  saveWorkspace(workspace);
  return workspace;
}

export function saveWorkspace(workspace) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  } catch {
    // The app remains usable in private, embedded, or static-file contexts.
  }
}

function safeRemoveWorkspace() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage restrictions.
  }
}

export function createCampaignId(name) {
  const slug = String(name || 'campaign')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  return `${slug || 'campaign'}-${Date.now().toString(36)}`;
}

export function normalizeCampaign(plan, input = {}) {
  const now = new Date().toISOString();
  const campaignName = plan.campaignName || `${input.brandName || 'Brand'} Loyalty Accelerator`;
  return {
    ...getDefaultCampaign(),
    ...plan,
    id: plan.id || createCampaignId(campaignName),
    campaignName,
    brandName: plan.brandName || input.brandName || 'Brand',
    businessGoal: plan.businessGoal || input.businessGoal || '',
    targetTiers: Array.isArray(plan.targetTiers) && plan.targetTiers.length ? plan.targetTiers : input.targetTiers || ['Standard'],
    channels: Array.isArray(plan.channels) && plan.channels.length ? plan.channels : ['Push', 'Email', 'In-app', 'Wallet'],
    assumptions: Array.isArray(plan.assumptions) ? plan.assumptions : [],
    exclusions: Array.isArray(plan.exclusions) ? plan.exclusions : [],
    status: plan.status || 'draft',
    pointsMultiplier: clampNumber(plan.pointsMultiplier, 1, 10, 2),
    budgetCap: clampNumber(plan.budgetCap, 0, 10000000, 10000),
    projectedMarginImpact: clampNumber(plan.projectedMarginImpact, 0, 100, 8),
    createdAt: plan.createdAt || now,
    updatedAt: now,
  };
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

export function validateCampaign(campaign) {
  const checks = [
    {
      label: 'Campaign name',
      ok: Boolean(campaign.campaignName?.trim()),
      detail: 'Name is required for exports, approvals, and analytics.',
    },
    {
      label: 'Audience eligibility',
      ok: Array.isArray(campaign.targetTiers) && campaign.targetTiers.length > 0,
      detail: 'At least one loyalty tier must be eligible.',
    },
    {
      label: 'Offer economics',
      ok: campaign.pointsMultiplier <= 5 && campaign.projectedMarginImpact <= 20,
      detail: 'Multiplier and margin impact stay within starter guardrails.',
    },
    {
      label: 'Redemption clarity',
      ok: Boolean(campaign.redemptionMethod?.trim()) && Boolean(campaign.frequencyCap?.trim()),
      detail: 'Customer action and frequency cap are explicit.',
    },
    {
      label: 'Legal and exclusions',
      ok: Boolean(campaign.legalCopy?.trim()) && campaign.exclusions.length > 0,
      detail: 'Legal copy and exclusions reduce launch ambiguity.',
    },
    {
      label: 'Channel readiness',
      ok: Boolean(campaign.pushNotification) && Boolean(campaign.emailSubject) && Boolean(campaign.inAppMessage),
      detail: 'Push, email, and in-app copy are present.',
    },
  ];

  return {
    checks,
    score: Math.round((checks.filter((check) => check.ok).length / checks.length) * 100),
  };
}

export function scoreCampaign(campaign) {
  const text = `${campaign.campaignName} ${campaign.mechanicsDetail} ${campaign.activeWindow}`.toLowerCase();
  const hasUrgency = /(today|hour|limited|ends|window|flash|weekday|weekend|expires)/.test(text);
  const hasAutoApply = /(auto|scan|barcode|wallet)/.test(text);
  const hasCap = /(cap|limit|once|1 redemption|per member)/.test(`${campaign.frequencyCap} ${campaign.mechanicsDetail}`.toLowerCase());
  const wideAudience = campaign.targetTiers.length >= 3;
  const richChannels = campaign.channels.length >= 3;

  const lossAversionScore = clampScore(52 + (hasUrgency ? 24 : 0) + (campaign.activeWindow ? 10 : 0) + (richChannels ? 6 : 0));
  const frictionScore = clampScore(58 + (hasAutoApply ? 22 : -8) + (campaign.redemptionMethod ? 12 : 0) - (campaign.promoCode?.length > 12 ? 6 : 0));
  const fatigueScore = clampScore(84 - campaign.pointsMultiplier * 5 - campaign.projectedMarginImpact + (hasCap ? 14 : 0) - (wideAudience ? 7 : 0));
  const marginScore = clampScore(92 - campaign.projectedMarginImpact * 2 - campaign.pointsMultiplier * 4 + (campaign.budgetCap ? 8 : 0));
  const readiness = validateCampaign(campaign).score;

  return {
    lossAversionScore,
    lossAversionFeedback: hasUrgency
      ? 'The campaign uses a defined time window, which creates a clear reason to act without relying on vague hype.'
      : 'Urgency is soft. Add a real expiration, countdown, or tier-protection angle before launch.',
    frictionScore,
    frictionFeedback: hasAutoApply
      ? 'Redemption is easy because the member can scan or use the wallet pass without manual registration.'
      : 'Friction is elevated. Consider auto-enrollment or wallet-based redemption instead of code entry.',
    fatigueScore,
    fatigueFeedback: hasCap
      ? 'Frequency controls and caps protect margin and reduce list fatigue.'
      : 'Fatigue risk is higher because the offer lacks strong redemption limits or cooldown rules.',
    marginScore,
    marginFeedback:
      marginScore >= 75
        ? 'Projected economics are inside a reasonable starter guardrail.'
        : 'Margin exposure needs review. Lower the multiplier, narrow eligibility, or add a tighter budget cap.',
    readinessScore: readiness,
  };
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function personalizeText(text, customer) {
  if (!text) return '';
  const context = { user: customer };
  return text.replace(/\{\{\s*([a-zA-Z0-9_.]+)(?:\s*\|\s*default\s*:\s*['"]([^'"]*)['"])?\s*\}\}/g, (_match, path, fallback) => {
    const value = path.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), context);
    return value == null || value === '' ? fallback || '' : String(value);
  });
}

export function buildExportBundle(campaign) {
  return {
    campaign,
    braze: {
      name: campaign.campaignName,
      channels: campaign.channels,
      trigger: campaign.activeWindow,
      segment: campaign.targetTiers.map((tier) => `membership_tier = ${tier}`).join(' OR '),
      messages: {
        push: campaign.pushNotification,
        email_subject: campaign.emailSubject,
        in_app: campaign.inAppMessage,
      },
      custom_attributes: {
        promo_code: campaign.promoCode,
        points_multiplier: campaign.pointsMultiplier,
      },
    },
    walletPassBrief: {
      brandName: campaign.brandName,
      passTitle: campaign.campaignName,
      barcodeValue: campaign.promoCode,
      foregroundFields: ['points_balance', 'membership_tier'],
      backFields: ['mechanicsDetail', 'legalCopy', 'exclusions'],
    },
    analyticsEvents: [
      'campaign_generated',
      'campaign_approved',
      'wallet_pass_viewed',
      'offer_loaded',
      'offer_redeemed',
    ],
  };
}

export async function generatePromotionPlan(input) {
  const response = await fetch('/api/generate-campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).catch(() => null);

  if (response?.ok) {
    const data = await response.json();
    return normalizeCampaign(data.campaign, input);
  }

  return normalizeCampaign(mockCampaign(input), input);
}

function mockCampaign({ businessGoal, brandName, targetTiers, budgetCap, projectedMarginImpact }) {
  const cleanBrand = brandName || 'Your Brand';
  const goal = businessGoal || 'Increase repeat purchases from loyalty members.';
  const tiers = targetTiers?.length ? targetTiers : ['Standard'];
  const isCoffee = /coffee|latte|espresso|afternoon/i.test(`${goal} ${cleanBrand}`);

  if (isCoffee) {
    return {
      campaignName: 'Afternoon Espresso Double-Star Rush',
      tagline: 'A precise points boost for the quietest afternoon hours.',
      brandName: cleanBrand,
      businessGoal: goal,
      targetTiers: tiers,
      pointsMultiplier: 2,
      promoCode: 'LATTERUSH',
      activeWindow: 'Monday-Thursday, 2:00 PM-5:00 PM',
      redemptionMethod: 'Auto-applied when the member scans their loyalty barcode.',
      budgetCap,
      projectedMarginImpact,
      frequencyCap: '1 redemption per member per day',
      mechanicsDetail: `Earn 2x points on espresso, latte, and macchiato purchases between 2:00 PM and 5:00 PM, Monday through Thursday. Eligible ${tiers.join(', ')} members receive points automatically after scanning their loyalty barcode.`,
      pushNotification: "Hey {{ user.first_name | default: 'there' }}, your 2x latte window is open from 2-5 PM today.",
      emailSubject: "{{ user.first_name | default: 'there' }}, 2x points are waiting this afternoon",
      inAppMessage: 'AFTERNOON DOUBLE POINTS\nScan your loyalty barcode between 2 PM and 5 PM to earn 2x points on handcrafted espresso drinks.',
      legalCopy: 'Valid at participating stores only. Rewards post within 1 hour. Cannot be combined with other offers.',
      exclusions: ['Delivery marketplace orders', 'Gift cards', 'Bottled beverages'],
      assumptions: ['Afternoon traffic is below morning peak.', 'Eligible members have push or email consent.', 'POS can identify eligible SKUs.'],
    };
  }

  return {
    campaignName: 'Tier Accelerator Challenge',
    tagline: 'A controlled points boost for members most likely to return.',
    brandName: cleanBrand,
    businessGoal: goal,
    targetTiers: tiers,
    pointsMultiplier: 3,
    promoCode: 'BOOST3X',
    activeWindow: 'Friday-Sunday',
    redemptionMethod: 'Auto-applied after loyalty scan or wallet pass redemption.',
    budgetCap,
    projectedMarginImpact,
    frequencyCap: '2 redemptions per member during campaign window',
    mechanicsDetail: `Receive 3x loyalty points on eligible purchases this weekend. Available for ${tiers.join(', ')} members. Members must scan their loyalty barcode or wallet pass before payment.`,
    pushNotification: "Hey {{ user.first_name | default: 'there' }}, 3x points are live this weekend.",
    emailSubject: 'Your weekend points accelerator is ready',
    inAppMessage: 'WEEKEND POINTS ACCELERATOR\nTriple your points on eligible purchases this weekend. Scan your loyalty barcode before checkout.',
    legalCopy: 'Valid on eligible purchases only. Excludes returns, gift cards, and marketplace orders.',
    exclusions: ['Gift cards', 'Returns', 'Third-party marketplace purchases'],
    assumptions: ['Weekend demand can absorb incremental rewards.', 'Eligible tiers have recent purchase intent.', 'POS supports campaign code attribution.'],
  };
}

export { DEFAULT_PLAN };
