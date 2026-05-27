import React, { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle, HelpCircle, Info, Trash2 } from 'lucide-react';

export default function Settings({ apiKey, setApiKey }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    const cleanKey = keyInput.trim();
    localStorage.setItem('gemini_api_key', cleanKey);
    setApiKey(cleanKey);
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setKeyInput('');
    setApiKey('');
    setSaveStatus('cleared');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="fade-in" style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="sidebar-logo-icon">
            <Key size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Gemini API Settings</h2>
            <p className="header-title-desc">Configure your API Key to enable live loyalty planning</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="api-key">Gemini API Key</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                className="form-input"
                placeholder="AIzaSy..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                style={{ paddingRight: '3rem', fontFamily: 'monospace' }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Save API Key
            </button>
            {apiKey && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClear}
                style={{ color: 'var(--error)' }}
              >
                <Trash2 size={16} /> Delete Key
              </button>
            )}
          </div>
        </form>

        {saveStatus === 'success' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--border-radius-md)',
            color: 'var(--success)',
            fontSize: '0.9rem'
          }}>
            <CheckCircle size={16} /> API Key saved successfully. LoyaltyBoost is now in **Live AI mode**.
          </div>
        )}

        {saveStatus === 'cleared' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: 'var(--border-radius-md)',
            color: 'var(--warning)',
            fontSize: '0.9rem'
          }}>
            <Info size={16} /> API Key deleted. Running in **Simulated Mock mode**.
          </div>
        )}
      </div>

      <div className="panel" style={{ backgroundColor: 'rgba(234, 179, 8, 0.02)', borderColor: 'rgba(234, 179, 8, 0.1)' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <HelpCircle size={20} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Shared Credentials API</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              We share the same configuration storage key as your **SmartCanvas AI** application. Since you have already saved your Gemini key on your computer, this project will automatically connect and run in live mode once launched!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
