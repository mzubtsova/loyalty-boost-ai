const MODEL_NAME = 'gemini-2.5-flash';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: 'AI provider is not configured. The client will use the deterministic campaign engine.' });
  }

  const input = request.body || {};
  const prompt = buildPrompt(input);

  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.55,
          responseMimeType: 'application/json',
        },
        systemInstruction: {
          parts: [{
            text: 'You are a senior loyalty CRM strategist. Return only valid JSON. Build realistic, margin-aware campaign plans with operational guardrails.',
          }],
        },
      }),
    });

    if (!geminiResponse.ok) {
      const error = await geminiResponse.json().catch(() => ({}));
      return response.status(geminiResponse.status).json({ error: error.error?.message || 'Gemini request failed' });
    }

    const data = await geminiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return response.status(502).json({ error: 'Gemini returned no campaign text' });

    return response.status(200).json({ campaign: parseJson(text) });
  } catch (error) {
    return response.status(500).json({ error: error.message || 'Unexpected generation error' });
  }
}

function buildPrompt(input) {
  return `Create one production-ready loyalty campaign.

Input:
- Brand: ${input.brandName || 'Brand'}
- Business goal: ${input.businessGoal || 'Increase loyalty engagement'}
- Eligible tiers: ${(input.targetTiers || ['Standard']).join(', ')}
- Budget cap: ${input.budgetCap || 10000}
- Projected margin impact target: ${input.projectedMarginImpact || 10}%
- Channels: ${(input.channels || ['Push', 'Email', 'In-app', 'Wallet']).join(', ')}

Return this JSON shape exactly:
{
  "campaignName": "string",
  "tagline": "string",
  "brandName": "string",
  "businessGoal": "string",
  "targetTiers": ["string"],
  "status": "draft",
  "pointsMultiplier": 2,
  "promoCode": "SHORTCODE",
  "offerType": "points_multiplier",
  "activeWindow": "string",
  "redemptionMethod": "string",
  "budgetCap": 10000,
  "projectedMarginImpact": 10,
  "frequencyCap": "string",
  "exclusions": ["string"],
  "mechanicsDetail": "string",
  "pushNotification": "string with {{ user.first_name | default: 'there' }} if useful",
  "emailSubject": "string",
  "inAppMessage": "string",
  "legalCopy": "string",
  "channels": ["Push", "Email", "In-app", "Wallet"],
  "assumptions": ["string"]
}`;
}

function parseJson(text) {
  const trimmed = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(trimmed);
}
