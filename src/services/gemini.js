/**
 * Service client for Gemini API integrations in LoyaltyBoost AI.
 * Includes exponential backoff and mock responders.
 */

const MODEL_NAME = 'gemini-3.5-flash';

function cleanAndParseJSON(text) {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    return JSON.parse(cleanText.trim());
  } catch (e) {
    console.error("Failed to parse JSON response:", text, e);
    throw new Error("Invalid JSON format in model output.");
  }
}

async function callGemini(prompt, apiKey, systemInstruction = '') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
  
  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json"
    }
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const maxRetries = 3;
  let delay = 1500;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP error! status: ${response.status}`;
        
        const isRetryable = response.status === 503 || 
                            response.status === 429 || 
                            errMsg.toLowerCase().includes('demand') || 
                            errMsg.toLowerCase().includes('overloaded') ||
                            errMsg.toLowerCase().includes('resource_exhausted') ||
                            errMsg.toLowerCase().includes('capacity');

        if (isRetryable && attempt < maxRetries) {
          console.warn(`Gemini API attempt ${attempt} failed: "${errMsg}". Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2.5;
          continue;
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error("No response text received from Gemini.");
      }

      return cleanAndParseJSON(textResponse);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.warn(`Gemini API attempt ${attempt} threw: "${error.message}". Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2.5;
    }
  }
}

/**
 * Generate Promotion Mechanics
 */
export async function generatePromotionPlan({ businessGoal, brandName, targetTiers }, apiKey) {
  if (!apiKey) {
    return getMockPromotion(businessGoal, brandName, targetTiers);
  }

  const systemInstruction = `You are an expert loyalty marketing manager and CRM rewards architect.
Generate a structured loyalty promotion plan that addresses the specified business goal.
Use dynamic Liquid personalization tags in the notification copy where appropriate. E.g.
- {{ user.first_name | default: 'there' }}
- {{ user.points_needed | default: '50' }}
- {{ user.favorite_flavor | default: 'your favorites' }}
Return your output ONLY as a JSON object matching this structure:
{
  "campaignName": "...",
  "tagline": "...",
  "pointsMultiplier": 3,
  "mechanicsDetail": "Detailed text describing how the user unlocks the offer, what tiers are eligible, and terms.",
  "pushNotification": "Push notification copy containing Liquid tags.",
  "emailSubject": "Email subject copy containing Liquid tags.",
  "inAppMessage": "In-app modal title & body copy.",
  "promoCode": "UPGRADE3X"
}`;

  const prompt = `Brand Name: ${brandName}
Business Goal: ${businessGoal}
Eligible Loyalty Tiers: ${targetTiers.join(', ')}

Draft a detailed, high-performance loyalty campaign following the JSON schema structure exactly.`;

  return callGemini(prompt, apiKey, systemInstruction);
}

/**
 * Generate Behavioral Critique
 */
export async function generateBehavioralCritique({ campaignName, mechanicsDetail }, apiKey) {
  if (!apiKey) {
    return getMockCritique(campaignName, mechanicsDetail);
  }

  const systemInstruction = `You are a behavioral psychologist specializing in loyalty program game-design and consumer response economics.
Audit the given campaign mechanics and assign scores (0 to 100) and qualitative feedback for three dimensions:
1. Loss Aversion: How effectively the campaign leverages scarcity, FOMO, or tier loss.
2. Friction: How easy the offer is to understand, track, and redeem. Lower friction means a higher score.
3. Fatigue Risk: The danger of customer boredom, margin erosion, or oversaturation. Lower fatigue risk means a higher score.

Return your output ONLY as a JSON object matching this structure:
{
  "lossAversionScore": 85,
  "lossAversionFeedback": "...",
  "frictionScore": 75,
  "frictionFeedback": "...",
  "fatigueScore": 90,
  "fatigueFeedback": "..."
}`;

  const prompt = `Campaign Name: ${campaignName}
Mechanics Detail: ${mechanicsDetail}

Perform the behavioral psychology audit and return the scores inside the JSON structure.`;

  return callGemini(prompt, apiKey, systemInstruction);
}

// ==========================================
// MOCK DATA GENERATORS (FALLBACKS)
// ==========================================

function getMockPromotion(businessGoal, brandName, targetTiers) {
  const goalLower = businessGoal.toLowerCase();
  
  if (goalLower.includes('coffee') || goalLower.includes('latte') || goalLower.includes('afternoon') || brandName.toLowerCase().includes('starbucks')) {
    return {
      campaignName: "Afternoon Espresso Double-Star Rush",
      tagline: "Double stars. Infinite afternoon vibes.",
      pointsMultiplier: 2,
      mechanicsDetail: `Earn 2x Stars on any Espresso, Latte, or Macchiato purchase made between 2:00 PM and 5:00 PM, Monday through Thursday. Exclusive to ${targetTiers.join(' and ')} members. Stars will auto-credit to your account wallet within 1 hour of scanning your app barcode.`,
      pushNotification: "🕒 Double Star Rush! Hey {{ user.first_name | default: 'coffee lover' }}, get 2x Stars on lattes from 2-5 PM today!",
      emailSubject: "☕ {{ user.first_name | default: 'there' }}, double stars are brewing this afternoon!",
      inAppMessage: "🌟 AFTERNOON STAR BURST\nEarn double points on all hand-crafted beverages between 2 PM and 5 PM today. Tap to load coupon into wallet.",
      promoCode: "LATTERUSH"
    };
  }

  return {
    campaignName: "Exclusive Tier Accelerator Challenge",
    tagline: "Boost your balance. Unlock the next level.",
    pointsMultiplier: 3,
    mechanicsDetail: `Receive 3x Loyalty Points on all purchases this weekend! Valid Friday 12:01 AM through Sunday 11:59 PM. Available for all ${targetTiers.join(', ')} members. Use code in wallet or scan member card.`,
    pushNotification: "⚡ 3X POINTS ALERT! Hey {{ user.first_name | default: 'there' }}, triple your points on all purchases this weekend only!",
    emailSubject: "💎 {% if user.membership_tier == 'Gold' %}VIP Privilege: {% endif %}Get 3x Points this weekend!",
    inAppMessage: "💎 WEEKEND ACCELERATOR\nTriple your loyalty balance on everything in-store. Accelerate your path to your next reward! Coupon auto-applied at checkout.",
    promoCode: "BOOST3X"
  };
}

function getMockCritique(campaignName, mechanicsDetail) {
  const nameLower = campaignName.toLowerCase();
  
  if (nameLower.includes('espresso') || nameLower.includes('afternoon') || nameLower.includes('star')) {
    return {
      lossAversionScore: 82,
      lossAversionFeedback: "High loss aversion score. Restricting the double points to a narrow 3-hour window (2-5 PM) creates strong situational urgency. Customers feel that skipping their afternoon coffee break results in a lost savings opportunity.",
      frictionScore: 88,
      frictionFeedback: "Excellent friction rating. Points are auto-applied upon scanning the standard app barcode. Marketers don't require the user to pre-register or input coupon codes, minimizing checkout delay.",
      fatigueScore: 78,
      fatigueFeedback: "Moderate fatigue score. While highly effective as a recurring weekly event, running it daily might lead to margin erosion and train customers to never buy coffee at standard price in the afternoon."
    };
  }

  return {
    lossAversionScore: 70,
    lossAversionFeedback: "Moderate loss aversion. A weekend-long duration provides a comfortable timeline, which slightly reduces the instant urgency of the offer compared to flash 3-hour sales.",
    frictionScore: 80,
    frictionFeedback: "Good friction score. Requires the customer to ensure they scan their barcode at checkout, but point multipliers are handled automatically on the backend server.",
    fatigueScore: 85,
    fatigueFeedback: "Strong fatigue protection. Since it is limited to a single weekend challenge, it doesn't cause product fatigue and triggers a healthy spike in average order value (AOV)."
  };
}
