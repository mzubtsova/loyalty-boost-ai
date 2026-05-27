import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Settings as SettingsIcon, Check } from 'lucide-react';
import PromoPlanner from './components/PromoPlanner';
import Settings from './components/Settings';

const DEFAULT_PLAN = {
  campaignName: "Afternoon Espresso Double Star Rush",
  tagline: "Double stars. Infinite afternoon vibes.",
  pointsMultiplier: 2,
  mechanicsDetail: "Earn 2x Stars on any Espresso, Latte, or Macchiato purchase made between 2:00 PM and 5:00 PM, Monday through Thursday. Exclusive to Silver and Gold members. Stars will auto-credit to your account wallet within 1 hour of scanning your app barcode.",
  pushNotification: "🕒 Double Star Rush! Hey {{ user.first_name | default: 'coffee lover' }}, get 2x Stars on lattes from 2-5 PM today!",
  emailSubject: "☕ {{ user.first_name | default: 'there' }}, double stars are brewing this afternoon!",
  inAppMessage: "🌟 AFTERNOON STAR BURST\nEarn double points on all hand-crafted beverages between 2 PM and 5 PM today. Tap to load coupon into wallet.",
  promoCode: "LATTERUSH"
};

export default function App() {
  const [activeTab, setActiveTab] = useState('planner');
  const [apiKey, setApiKey] = useState('');
  const [toast, setToast] = useState('');
  
  // Shared state holding active loyalty promotion details
  const [promoPlan, setPromoPlan] = useState(DEFAULT_PLAN);

  // Load API Key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(savedKey);
  }, []);

  const triggerToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  };

  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'planner':
        return { title: 'Loyalty & Promotion Planner', desc: 'Design rewards mechanics and preview customer experience in real-time' };
      case 'settings':
        return { title: 'Settings', desc: 'Configure API connections' };
      default:
        return { title: 'LoyaltyBoost AI', desc: 'CRM Promotion Copilot' };
    }
  };

  const { title, desc } = getHeaderDetails();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Trophy size={16} />
          </div>
          <span className="sidebar-logo-text">LoyaltyBoost AI</span>
        </div>

        <div className="sidebar-menu">
          <button
            onClick={() => setActiveTab('planner')}
            className={`sidebar-item ${activeTab === 'planner' ? 'active' : ''}`}
          >
            <Trophy size={18} />
            Promo Planner
          </button>
        </div>

        <div className="sidebar-footer">
          <button
            onClick={() => setActiveTab('settings')}
            className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
            style={{ width: '100%' }}
          >
            <SettingsIcon size={18} />
            Settings
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1>{title}</h1>
            <p className="header-title-desc">{desc}</p>
          </div>

          <div className={`api-badge ${apiKey ? 'connected' : 'simulated'}`}>
            <span className="indicator"></span>
            <span>{apiKey ? 'Live AI Mode' : 'Simulated Mock Mode'}</span>
          </div>
        </header>

        {/* Content Render */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'planner' ? (
            <PromoPlanner
              apiKey={apiKey}
              promoPlan={promoPlan}
              setPromoPlan={setPromoPlan}
              triggerToast={triggerToast}
            />
          ) : (
            <Settings
              apiKey={apiKey}
              setApiKey={setApiKey}
            />
          )}
        </div>
      </main>

      {/* Global Toast */}
      {toast && (
        <div className="toast">
          <Check size={16} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
