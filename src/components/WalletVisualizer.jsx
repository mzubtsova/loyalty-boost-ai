import React, { useState, useEffect } from 'react';
import { Sparkles, Bell, CreditCard, Award, ArrowUpRight } from 'lucide-react';

function parseSimpleVariables(text, context) {
  if (!text) return '';
  // Basic substitution for {{ user.first_name | default: 'there' }}
  return text.replace(/\{\{\s*([a-zA-Z0-9_\.]+)(?:\s*\|\s*default\s*:\s*['"]([^'"]*)['"])?\s*\}\}/g, (match, path, defaultValue) => {
    const parts = path.split('.');
    let val = context;
    for (const part of parts) {
      if (val === null || val === undefined) break;
      val = val[part];
    }
    if (val === undefined || val === null || val === '') {
      return defaultValue !== undefined ? defaultValue : '';
    }
    return String(val);
  });
}

export default function WalletVisualizer({ promoPlan, brandName }) {
  // Local simulated customer profile state
  const [customer, setCustomer] = useState({
    first_name: "Marina",
    membership_tier: "Gold",
    points_balance: 1420,
    favorite_flavor: "Salted Caramel Cold Brew"
  });

  const getTierGradient = (tier) => {
    switch (tier) {
      case 'Gold': return 'var(--gold-gradient)';
      case 'Silver': return 'var(--silver-gradient)';
      case 'Bronze': return 'var(--bronze-gradient)';
      default: return 'linear-gradient(135deg, #44403c 0%, #1c1917 100%)';
    }
  };

  const getPointsProgress = () => {
    const pts = customer.points_balance;
    if (pts < 500) return { percent: (pts / 500) * 100, next: 500, label: 'Silver' };
    if (pts < 1500) return { percent: ((pts - 500) / 1000) * 100, next: 1500, label: 'Gold' };
    return { percent: 100, next: 'Maxed', label: 'VIP Platinum' };
  };

  const progress = getPointsProgress();
  
  // Create user context object to pass into variable resolver
  const context = {
    user: {
      first_name: customer.first_name,
      membership_tier: customer.membership_tier,
      points_balance: customer.points_balance,
      favorite_flavor: customer.favorite_flavor,
      points_needed: progress.next !== 'Maxed' ? progress.next - customer.points_balance : 0
    }
  };

  const resolvedPush = parseSimpleVariables(promoPlan.pushNotification, context);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Visualizer Phone Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Smartphone Mockup */}
        <div className="phone-wrapper">
          <div className="phone-mockup">
            <div className="phone-notch"></div>
            
            <div className="phone-screen">
              
              {/* Header Brand Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Loyalty Card</span>
                <span className="indicator" style={{ backgroundColor: 'var(--success)' }}></span>
              </div>

              {/* Digital Wallet Card */}
              <div className="wallet-card" style={{ background: getTierGradient(customer.membership_tier) }}>
                <div className="wallet-card-header">
                  <span className="wallet-logo" style={{ color: customer.membership_tier === 'Silver' ? '#0f172a' : '#1c1815' }}>
                    ☕ {brandName.toUpperCase() || "REWARDS"}
                  </span>
                  <span className="wallet-tier-label" style={{ 
                    color: customer.membership_tier === 'Silver' ? '#fff' : '#1c1815',
                    backgroundColor: customer.membership_tier === 'Silver' ? '#334155' : 'rgba(0,0,0,0.15)'
                  }}>
                    {customer.membership_tier} Tier
                  </span>
                </div>

                <div style={{ color: customer.membership_tier === 'Silver' ? '#0f172a' : '#1c1815' }}>
                  <div className="wallet-points-value">{customer.points_balance}</div>
                  <div className="wallet-points-label" style={{ color: customer.membership_tier === 'Silver' ? '#475569' : 'rgba(28,24,21,0.7)' }}>
                    Total Stars
                  </div>
                </div>

                <div className="wallet-progress-container" style={{ color: customer.membership_tier === 'Silver' ? '#0f172a' : '#1c1815' }}>
                  <div className="wallet-progress-bar-bg">
                    <div className="wallet-progress-bar-fill" style={{ 
                      width: `${progress.percent}%`,
                      backgroundColor: customer.membership_tier === 'Silver' ? '#0f172a' : '#fff' 
                    }}></div>
                  </div>
                  <div className="wallet-progress-text" style={{ color: customer.membership_tier === 'Silver' ? '#475569' : 'rgba(255,255,255,0.8)' }}>
                    <span>Progress: {Math.round(progress.percent)}%</span>
                    <span>Next: {progress.next} ({progress.label})</span>
                  </div>
                </div>
              </div>

              {/* In-App Marketing Banner */}
              <div className="phone-promo-banner" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', borderLeft: '3px solid var(--accent-gold)' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                    {promoPlan.pointsMultiplier}x Points Active!
                  </h4>
                  <p style={{ fontSize: '0.65rem', lineHeight: '1.2' }}>{promoPlan.tagline}</p>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Use code: <strong>{promoPlan.promoCode}</strong></p>
                </div>
              </div>

              {/* Push Notification Card (Locked/Unlock screen feel) */}
              {resolvedPush && (
                <div className="phone-notification">
                  <div className="notification-icon-bg">
                    <Bell size={14} />
                  </div>
                  <div className="notification-content">
                    <h5>{brandName || "LoyaltyBoost"}</h5>
                    <p>{resolvedPush}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Simulator Inputs (Right side of phone) */}
        <div className="panel" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Award size={16} style={{ color: 'var(--accent-gold)' }} />
            Profile Barcode Simulator
          </h4>
          
          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Mock Name</label>
            <input
              type="text"
              className="form-input"
              value={customer.first_name}
              onChange={(e) => setCustomer({ ...customer, first_name: e.target.value })}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Member Tier</label>
            <select
              className="form-select"
              value={customer.membership_tier}
              onChange={(e) => setCustomer({ ...customer, membership_tier: e.target.value })}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            >
              <option value="Bronze">Bronze Tier</option>
              <option value="Silver">Silver Tier</option>
              <option value="Gold">Gold Tier</option>
              <option value="Standard">Standard Tier</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Stars Balance</label>
            <input
              type="number"
              className="form-input"
              value={customer.points_balance}
              onChange={(e) => setCustomer({ ...customer, points_balance: Number(e.target.value) })}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Fav Drink/Product</label>
            <input
              type="text"
              className="form-input"
              value={customer.favorite_flavor}
              onChange={(e) => setCustomer({ ...customer, favorite_flavor: e.target.value })}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
