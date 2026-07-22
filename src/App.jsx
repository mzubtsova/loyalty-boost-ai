import { useEffect, useMemo, useState } from 'react';
import { BarChart3, ClipboardCheck, Database, Download, LayoutDashboard, Plus, Settings, Sparkles, Trophy } from 'lucide-react';
import PromoPlanner from './components/PromoPlanner';
import WalletVisualizer from './components/WalletVisualizer';
import BehavioralCritique from './components/BehavioralCritique';
import SettingsPanel from './components/Settings';
import { buildExportBundle, loadWorkspace, normalizeCampaign, saveWorkspace, scoreCampaign, validateCampaign } from './services/campaignEngine';

const NAV_ITEMS = [
  { id: 'workspace', label: 'Workspace', icon: LayoutDashboard },
  { id: 'wallet', label: 'Wallet QA', icon: Trophy },
  { id: 'audit', label: 'Risk Audit', icon: ClipboardCheck },
  { id: 'exports', label: 'Exports', icon: Download },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function App() {
  const [workspace, setWorkspace] = useState(() => loadWorkspace());
  const [activeTab, setActiveTab] = useState('workspace');
  const [toast, setToast] = useState('');

  const activeCampaign = useMemo(
    () => workspace.campaigns.find((campaign) => campaign.id === workspace.activeCampaignId) || workspace.campaigns[0],
    [workspace],
  );

  const score = useMemo(() => scoreCampaign(activeCampaign), [activeCampaign]);
  const validation = useMemo(() => validateCampaign(activeCampaign), [activeCampaign]);
  const exportBundle = useMemo(() => buildExportBundle(activeCampaign), [activeCampaign]);

  useEffect(() => {
    saveWorkspace(workspace);
  }, [workspace]);

  const updateWorkspace = (updater) => {
    setWorkspace((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      return next;
    });
  };

  const upsertCampaign = (campaign) => {
    const normalized = normalizeCampaign(campaign);
    updateWorkspace((current) => {
      const exists = current.campaigns.some((item) => item.id === normalized.id);
      return {
        activeCampaignId: normalized.id,
        campaigns: exists
          ? current.campaigns.map((item) => (item.id === normalized.id ? normalized : item))
          : [normalized, ...current.campaigns],
      };
    });
  };

  const updateActiveCampaign = (patch) => {
    updateWorkspace((current) => ({
      ...current,
      campaigns: current.campaigns.map((campaign) => (
        campaign.id === current.activeCampaignId
          ? normalizeCampaign({ ...campaign, ...patch, id: campaign.id, createdAt: campaign.createdAt })
          : campaign
      )),
    }));
  };

  const duplicateCampaign = () => {
    upsertCampaign({
      ...activeCampaign,
      id: undefined,
      status: 'draft',
      campaignName: `${activeCampaign.campaignName} Copy`,
      createdAt: undefined,
    });
    showToast('Campaign duplicated');
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };

  const copyExport = async () => {
    await navigator.clipboard.writeText(JSON.stringify(exportBundle, null, 2));
    showToast('Export bundle copied');
  };

  const downloadExport = () => {
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${activeCampaign.campaignName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-export.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const ActiveIcon = NAV_ITEMS.find((item) => item.id === activeTab)?.icon || LayoutDashboard;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="brand-icon"><Trophy size={18} /></div>
          <div>
            <strong>LoyaltyBoost AI</strong>
            <span>Promotion OS</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-card">
          <span>Readiness</span>
          <strong>{validation.score}%</strong>
          <div className="mini-meter"><span style={{ width: `${validation.score}%` }} /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow"><ActiveIcon size={14} /> {activeCampaign.status} campaign</p>
            <h1>{activeCampaign.campaignName}</h1>
            <p>{activeCampaign.brandName} - {activeCampaign.businessGoal}</p>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" onClick={duplicateCampaign} title="Duplicate campaign">
              <Plus size={18} />
            </button>
            <button className="btn btn-secondary" onClick={copyExport}>
              <Database size={16} /> Copy JSON
            </button>
            <button className="btn btn-primary" onClick={downloadExport}>
              <Download size={16} /> Export
            </button>
          </div>
        </header>

        {activeTab === 'workspace' && (
          <section className="workspace-grid">
            <PromoPlanner
              activeCampaign={activeCampaign}
              campaigns={workspace.campaigns}
              setActiveCampaignId={(id) => updateWorkspace((current) => ({ ...current, activeCampaignId: id }))}
              upsertCampaign={upsertCampaign}
              updateActiveCampaign={updateActiveCampaign}
              showToast={showToast}
            />
            <div className="stack">
              <BehavioralCritique score={score} validation={validation} compact />
              <WalletVisualizer campaign={activeCampaign} compact />
            </div>
          </section>
        )}

        {activeTab === 'wallet' && <WalletVisualizer campaign={activeCampaign} />}
        {activeTab === 'audit' && <BehavioralCritique score={score} validation={validation} />}
        {activeTab === 'exports' && (
          <section className="panel exports-panel">
            <div className="section-title">
              <BarChart3 size={18} />
              <div>
                <h2>Activation Export Bundle</h2>
                <p>CRM payload, wallet pass brief, campaign object, and analytics events.</p>
              </div>
            </div>
            <pre>{JSON.stringify(exportBundle, null, 2)}</pre>
          </section>
        )}
        {activeTab === 'settings' && <SettingsPanel validation={validation} />}
      </main>

      {toast && (
        <div className="toast">
          <Sparkles size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}
