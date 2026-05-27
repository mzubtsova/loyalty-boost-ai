import React, { useState } from 'react';
import { generatePromotionPlan, generateBehavioralCritique } from '../services/gemini';
import WalletVisualizer from './WalletVisualizer';
import BehavioralCritique from './BehavioralCritique';
import { Sparkles, ArrowRight, Loader2, Copy, Percent, ShieldCheck, Mail, MessageSquare, Smartphone } from 'lucide-react';

const DEFAULT_CRITIQUE = {
  lossAversionScore: 82,
  lossAversionFeedback: "High loss aversion score. Restricting the double points to a narrow 3-hour window (2-5 PM) creates strong situational urgency. Customers feel that skipping their afternoon coffee break results in a lost savings opportunity.",
  frictionScore: 88,
  frictionFeedback: "Excellent friction rating. Points are auto-applied upon scanning the standard app barcode. Marketers don't require the user to pre-register or input coupon codes, minimizing checkout delay.",
  fatigueScore: 78,
  fatigueFeedback: "Moderate fatigue score. While highly effective as a recurring weekly event, running it daily might lead to margin erosion and train customers to never buy coffee at standard price in the afternoon."
};

export default function PromoPlanner({ apiKey, promoPlan, setPromoPlan, triggerToast }) {
  const [businessGoal, setBusinessGoal] = useState("Increase weekday afternoon latte sales between 2 PM and 5 PM.");
  const [brandName, setBrandName] = useState("Starbucks");
  const [targetTiers, setTargetTiers] = useState(['Silver', 'Gold']);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('details');
  
  // Critique state initialized to match the default template plan
  const [critique, setCritique] = useState(DEFAULT_CRITIQUE);
  const [critiqueLoading, setCritiqueLoading] = useState(false);

  const tiersList = ['Bronze', 'Silver', 'Gold', 'Standard'];

  const handleTierToggle = (tier) => {
    if (targetTiers.includes(tier)) {
      setTargetTiers(targetTiers.filter(t => t !== tier));
    } else {
      setTargetTiers([...targetTiers, tier]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!businessGoal.trim() || !brandName.trim() || targetTiers.length === 0) {
      triggerToast("Please fill in all planner parameters.");
      return;
    }

    setIsLoading(true);
    setCritiqueLoading(true);
    
    try {
      // 1. Generate Promotion Plan
      const newPlan = await generatePromotionPlan({
        businessGoal,
        brandName,
        targetTiers
      }, apiKey);
      
      setPromoPlan(newPlan);
      triggerToast("Promotion plan designed!");

      // 2. Generate Behavioral Critique Audit
      const newCritique = await generateBehavioralCritique({
        campaignName: newPlan.campaignName,
        mechanicsDetail: newPlan.mechanicsDetail
      }, apiKey);

      setCritique(newCritique);
      triggerToast("Psychology audit completed!");

    } catch (err) {
      console.error(err);
      triggerToast(`Failed to generate: ${err.message}`);
    } finally {
      setIsLoading(false);
      setCritiqueLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${type} to clipboard!`);
  };

  return (
    <div className="fade-in split-view" style={{ flex: 1, alignItems: 'start' }}>
      
      {/* Left Column: Form + Generated Output */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Parameters Form Panel */}
        <div className="panel">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
            Plan Parameters
          </h3>

          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label" htmlFor="brand">Brand Name</label>
              <input
                id="brand"
                type="text"
                className="form-input"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="E.g., Starbucks, Sephora, Target..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="goal">Business Objective / Goal</label>
              <textarea
                id="goal"
                className="form-textarea"
                value={businessGoal}
                onChange={(e) => setBusinessGoal(e.target.value)}
                placeholder="What behavior are you trying to drive? E.g., clear breakfast sandwich inventory, reward weekend shoppers..."
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Eligible Tiers</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {tiersList.map(tier => {
                  const isChecked = targetTiers.includes(tier);
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => handleTierToggle(tier)}
                      className="btn"
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.8rem',
                        borderRadius: 'var(--border-radius-sm)',
                        backgroundColor: isChecked ? 'rgba(234, 179, 8, 0.12)' : 'var(--bg-tertiary)',
                        color: isChecked ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        borderColor: isChecked ? 'rgba(234, 179, 8, 0.3)' : 'var(--border-color)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="spin" size={16} /> Planning Campaign...
                </>
              ) : (
                <>
                  Generate Promotion Plan <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Plan Output Panel */}
        {promoPlan && !isLoading && (
          <div className="panel fade-in" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
            <div className="tab-container" style={{ borderColor: 'var(--border-color)' }}>
              <button
                className={`sub-tab ${activeSubTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('details')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Percent size={14} /> Campaign Details
              </button>
              <button
                className={`sub-tab ${activeSubTab === 'copy' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('copy')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <MessageSquare size={14} /> Copy Variants
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {activeSubTab === 'details' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: '#fff' }}>{promoPlan.campaignName}</h4>
                    <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      "{promoPlan.tagline}"
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', margin: '0.5rem 0' }}>
                    <div style={{ padding: '0.75rem 1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.05em' }}>Multiplier</span>
                      <strong style={{ fontSize: '1.5rem', color: 'var(--accent-gold)' }}>{promoPlan.pointsMultiplier}x Points</strong>
                    </div>
                    <div style={{ padding: '0.75rem 1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.05em' }}>Wallet Code</span>
                      <strong style={{ fontSize: '1.5rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>{promoPlan.promoCode}</strong>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                    <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Mechanics & Rules</strong>
                    {promoPlan.mechanicsDetail}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Subject</span>
                      <button onClick={() => handleCopy(promoPlan.emailSubject, 'Email Subject')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#fff' }}>{promoPlan.emailSubject}</p>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Push Notification</span>
                      <button onClick={() => handleCopy(promoPlan.pushNotification, 'Push Copy')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#fff' }}>{promoPlan.pushNotification}</p>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In-App Message (Copy)</span>
                      <button onClick={() => handleCopy(promoPlan.inAppMessage, 'In-App Copy')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{promoPlan.inAppMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Visualizer Phone + Psychology Critique */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Smartphone visual pass mockup wrapper */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smartphone size={16} style={{ color: 'var(--accent-gold)' }} />
            Customer Barcode & Wallet Preview
          </h3>
          <WalletVisualizer promoPlan={promoPlan} brandName={brandName} />
        </div>

        {/* Psychology critique analysis panel */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
            Behavioral Economics Critique
          </h3>
          <BehavioralCritique critique={critique} isLoading={critiqueLoading} />
        </div>

      </div>

    </div>
  );
}
