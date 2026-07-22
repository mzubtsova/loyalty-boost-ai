import { useState } from 'react';
import { ArrowRight, CheckCircle2, ClipboardList, Loader2, Save, SlidersHorizontal } from 'lucide-react';
import { generatePromotionPlan } from '../services/campaignEngine';

const TIERS = ['Standard', 'Bronze', 'Silver', 'Gold', 'VIP'];
const CHANNELS = ['Push', 'Email', 'In-app', 'Wallet'];
const STATUSES = ['draft', 'review', 'approved', 'ready'];

export default function PromoPlanner({
  activeCampaign,
  campaigns,
  setActiveCampaignId,
  upsertCampaign,
  updateActiveCampaign,
  showToast,
}) {
  const [form, setForm] = useState({
    brandName: activeCampaign.brandName,
    businessGoal: activeCampaign.businessGoal,
    targetTiers: activeCampaign.targetTiers,
    budgetCap: activeCampaign.budgetCap,
    projectedMarginImpact: activeCampaign.projectedMarginImpact,
    channels: activeCampaign.channels,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleValue = (field, value) => {
    setForm((current) => {
      const selected = current[field].includes(value);
      return {
        ...current,
        [field]: selected ? current[field].filter((item) => item !== value) : [...current[field], value],
      };
    });
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!form.brandName.trim() || !form.businessGoal.trim() || !form.targetTiers.length) {
      showToast('Brand, goal, and tiers are required');
      return;
    }

    setIsGenerating(true);
    try {
      const campaign = await generatePromotionPlan(form);
      upsertCampaign(campaign);
      showToast('Production campaign drafted');
    } catch (error) {
      showToast(error.message || 'Campaign generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFieldChange = (field, value) => {
    updateActiveCampaign({ [field]: value });
  };

  return (
    <div className="planner-grid">
      <section className="panel planner-panel">
        <div className="section-title">
          <SlidersHorizontal size={18} />
          <div>
            <h2>Campaign Generator</h2>
            <p>Draft margin-aware mechanics with launch guardrails.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="form-stack">
          <label>
            <span>Brand</span>
            <input
              value={form.brandName}
              onChange={(event) => setForm({ ...form, brandName: event.target.value })}
              placeholder="Starbucks, Sephora, Target"
            />
          </label>

          <label>
            <span>Business objective</span>
            <textarea
              value={form.businessGoal}
              onChange={(event) => setForm({ ...form, businessGoal: event.target.value })}
              placeholder="Drive weekday visits, reactivate lapsed buyers, protect tier status"
              rows={4}
            />
          </label>

          <div>
            <span className="field-label">Eligible tiers</span>
            <div className="chip-row">
              {TIERS.map((tier) => (
                <button
                  type="button"
                  key={tier}
                  className={`chip ${form.targetTiers.includes(tier) ? 'selected' : ''}`}
                  onClick={() => toggleValue('targetTiers', tier)}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="field-label">Channels</span>
            <div className="chip-row">
              {CHANNELS.map((channel) => (
                <button
                  type="button"
                  key={channel}
                  className={`chip ${form.channels.includes(channel) ? 'selected' : ''}`}
                  onClick={() => toggleValue('channels', channel)}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>

          <div className="form-two">
            <label>
              <span>Budget cap</span>
              <input
                type="number"
                min="0"
                value={form.budgetCap}
                onChange={(event) => setForm({ ...form, budgetCap: Number(event.target.value) })}
              />
            </label>
            <label>
              <span>Margin impact %</span>
              <input
                type="number"
                min="0"
                max="100"
                value={form.projectedMarginImpact}
                onChange={(event) => setForm({ ...form, projectedMarginImpact: Number(event.target.value) })}
              />
            </label>
          </div>

          <button className="btn btn-primary" disabled={isGenerating}>
            {isGenerating ? <Loader2 className="spin" size={16} /> : <ArrowRight size={16} />}
            {isGenerating ? 'Drafting campaign' : 'Generate campaign'}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-title">
          <ClipboardList size={18} />
          <div>
            <h2>Campaign Library</h2>
            <p>Saved drafts stay in this workspace.</p>
          </div>
        </div>

        <div className="campaign-list">
          {campaigns.map((campaign) => (
            <button
              key={campaign.id}
              className={`campaign-row ${campaign.id === activeCampaign.id ? 'active' : ''}`}
              onClick={() => setActiveCampaignId(campaign.id)}
            >
              <span>
                <strong>{campaign.campaignName}</strong>
                <small>{campaign.brandName} - {campaign.targetTiers.join(', ')}</small>
              </span>
              <em>{campaign.status}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="panel editor-panel">
        <div className="section-title">
          <Save size={18} />
          <div>
            <h2>Launch Details</h2>
            <p>Edit the structured fields used by audit and exports.</p>
          </div>
        </div>

        <div className="form-stack">
          <div className="form-two">
            <label>
              <span>Status</span>
              <select value={activeCampaign.status} onChange={(event) => handleFieldChange('status', event.target.value)}>
                {STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label>
              <span>Multiplier</span>
              <input type="number" min="1" max="10" value={activeCampaign.pointsMultiplier} onChange={(event) => handleFieldChange('pointsMultiplier', Number(event.target.value))} />
            </label>
          </div>

          <label>
            <span>Campaign name</span>
            <input value={activeCampaign.campaignName} onChange={(event) => handleFieldChange('campaignName', event.target.value)} />
          </label>
          <label>
            <span>Active window</span>
            <input value={activeCampaign.activeWindow} onChange={(event) => handleFieldChange('activeWindow', event.target.value)} />
          </label>
          <label>
            <span>Redemption method</span>
            <input value={activeCampaign.redemptionMethod} onChange={(event) => handleFieldChange('redemptionMethod', event.target.value)} />
          </label>
          <label>
            <span>Mechanics and rules</span>
            <textarea rows={5} value={activeCampaign.mechanicsDetail} onChange={(event) => handleFieldChange('mechanicsDetail', event.target.value)} />
          </label>
          <div className="form-two">
            <label>
              <span>Promo code</span>
              <input value={activeCampaign.promoCode} onChange={(event) => handleFieldChange('promoCode', event.target.value.toUpperCase())} />
            </label>
            <label>
              <span>Frequency cap</span>
              <input value={activeCampaign.frequencyCap} onChange={(event) => handleFieldChange('frequencyCap', event.target.value)} />
            </label>
          </div>
          <label>
            <span>Push copy</span>
            <textarea rows={2} value={activeCampaign.pushNotification} onChange={(event) => handleFieldChange('pushNotification', event.target.value)} />
          </label>
          <label>
            <span>Email subject</span>
            <input value={activeCampaign.emailSubject} onChange={(event) => handleFieldChange('emailSubject', event.target.value)} />
          </label>
          <label>
            <span>Legal copy</span>
            <textarea rows={2} value={activeCampaign.legalCopy} onChange={(event) => handleFieldChange('legalCopy', event.target.value)} />
          </label>
          <div className="save-note">
            <CheckCircle2 size={16} />
            Changes save automatically in the workspace.
          </div>
        </div>
      </section>
    </div>
  );
}
