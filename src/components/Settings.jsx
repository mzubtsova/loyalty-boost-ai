import { Database, KeyRound, Server, ShieldCheck } from 'lucide-react';

export default function SettingsPanel({ validation }) {
  return (
    <section className="settings-grid">
      <div className="panel">
        <div className="section-title">
          <Server size={18} />
          <div>
            <h2>Production Architecture</h2>
            <p>AI requests now route through a Vercel serverless API.</p>
          </div>
        </div>
        <div className="settings-list">
          <div>
            <KeyRound size={17} />
            <span>
              <strong>Server-side AI key</strong>
              <small>Set `GEMINI_API_KEY` in Vercel environment variables. No customer API keys are stored in the browser.</small>
            </span>
          </div>
          <div>
            <Database size={17} />
            <span>
              <strong>Workspace persistence</strong>
              <small>Campaign drafts autosave locally today; the schema is ready for Supabase, Postgres, or Firebase persistence.</small>
            </span>
          </div>
          <div>
            <ShieldCheck size={17} />
            <span>
              <strong>Launch guardrails</strong>
              <small>Readiness is currently {validation.score}%, based on eligibility, economics, redemption clarity, legal copy, and channel readiness.</small>
            </span>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="section-title">
          <ShieldCheck size={18} />
          <div>
            <h2>Next Real Integrations</h2>
            <p>The export bundle is shaped for CRM and wallet activation.</p>
          </div>
        </div>
        <ul className="roadmap-list">
          <li>Braze, Iterable, Klaviyo, or Salesforce Marketing Cloud draft creation.</li>
          <li>Apple Wallet `.pkpass` and Google Wallet pass object generation.</li>
          <li>Organization accounts, role-based approvals, and campaign audit logs.</li>
          <li>Historical redemption data for ROI and fatigue prediction.</li>
        </ul>
      </div>
    </section>
  );
}
