import { useMemo, useState } from 'react';
import { Bell, QrCode, Smartphone, UserRound } from 'lucide-react';
import { personalizeText } from '../services/campaignEngine';

export default function WalletVisualizer({ campaign, compact = false }) {
  const [customer, setCustomer] = useState({
    first_name: 'Marina',
    membership_tier: 'Gold',
    points_balance: 1420,
    favorite_flavor: 'Salted Caramel Cold Brew',
    points_needed: 80,
  });

  const personalizedPush = useMemo(() => personalizeText(campaign.pushNotification, customer), [campaign.pushNotification, customer]);
  const personalizedEmail = useMemo(() => personalizeText(campaign.emailSubject, customer), [campaign.emailSubject, customer]);
  const progress = Math.min(100, Math.max(0, Math.round((customer.points_balance / 1500) * 100)));

  return (
    <section className={`panel wallet-section ${compact ? 'compact-card' : ''}`}>
      <div className="section-title">
        <Smartphone size={18} />
        <div>
          <h2>Wallet Pass QA</h2>
          <p>Preview personalization, pass fields, and barcode activation.</p>
        </div>
      </div>

      <div className="wallet-grid">
        <div className="phone-frame">
          <div className="phone-camera" />
          <div className="phone-screen">
            <div className="phone-status">
              <span>{campaign.brandName}</span>
              <strong>{campaign.status}</strong>
            </div>

            <div className="pass-card">
              <div className="pass-header">
                <span>{campaign.brandName}</span>
                <em>{customer.membership_tier}</em>
              </div>
              <h3>{campaign.campaignName}</h3>
              <p>{campaign.tagline}</p>
              <div className="pass-points">
                <strong>{customer.points_balance}</strong>
                <span>points balance</span>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${progress}%` }} />
              </div>
              <div className="pass-meta">
                <span>{campaign.pointsMultiplier}x points</span>
                <span>{campaign.activeWindow}</span>
              </div>
            </div>

            <div className="barcode-card">
              <QrCode size={72} />
              <strong>{campaign.promoCode}</strong>
              <span>{campaign.redemptionMethod}</span>
            </div>

            <div className="notification-preview">
              <Bell size={16} />
              <div>
                <strong>{campaign.brandName}</strong>
                <p>{personalizedPush}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="qa-panel">
          <div className="section-title small">
            <UserRound size={16} />
            <div>
              <h3>Customer Variables</h3>
              <p>Test Liquid-style substitutions before export.</p>
            </div>
          </div>

          <div className="form-stack">
            <label>
              <span>First name</span>
              <input value={customer.first_name} onChange={(event) => setCustomer({ ...customer, first_name: event.target.value })} />
            </label>
            <label>
              <span>Tier</span>
              <select value={customer.membership_tier} onChange={(event) => setCustomer({ ...customer, membership_tier: event.target.value })}>
                <option>Standard</option>
                <option>Bronze</option>
                <option>Silver</option>
                <option>Gold</option>
                <option>VIP</option>
              </select>
            </label>
            <label>
              <span>Points balance</span>
              <input type="number" value={customer.points_balance} onChange={(event) => setCustomer({ ...customer, points_balance: Number(event.target.value) })} />
            </label>
          </div>

          <div className="copy-preview">
            <span>Resolved email subject</span>
            <p>{personalizedEmail}</p>
          </div>
          <div className="copy-preview">
            <span>Resolved push</span>
            <p>{personalizedPush}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
