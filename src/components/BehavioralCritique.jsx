import { AlertTriangle, CheckCircle2, ShieldCheck, TrendingUp, Zap } from 'lucide-react';

export default function BehavioralCritique({ score, validation, compact = false }) {
  const metrics = [
    {
      name: 'Urgency and Loss Aversion',
      value: score.lossAversionScore,
      feedback: score.lossAversionFeedback,
      icon: Zap,
    },
    {
      name: 'Redemption Friction',
      value: score.frictionScore,
      feedback: score.frictionFeedback,
      icon: CheckCircle2,
    },
    {
      name: 'Fatigue Protection',
      value: score.fatigueScore,
      feedback: score.fatigueFeedback,
      icon: ShieldCheck,
    },
    {
      name: 'Margin Guardrail',
      value: score.marginScore,
      feedback: score.marginFeedback,
      icon: TrendingUp,
    },
  ];

  return (
    <section className={`panel audit-section ${compact ? 'compact-card' : ''}`}>
      <div className="section-title">
        <ShieldCheck size={18} />
        <div>
          <h2>Production Risk Audit</h2>
          <p>Deterministic guardrails plus marketer-readable critique.</p>
        </div>
      </div>

      <div className="readiness-card">
        <div>
          <span>Launch readiness</span>
          <strong>{validation.score}%</strong>
        </div>
        <div className="meter"><span style={{ width: `${validation.score}%` }} /></div>
      </div>

      <div className="metric-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.name} className="metric-card">
              <div className="metric-header">
                <Icon size={17} />
                <span>{metric.name}</span>
                <strong>{metric.value}</strong>
              </div>
              <div className="meter"><span className={getTone(metric.value)} style={{ width: `${metric.value}%` }} /></div>
              <p>{metric.feedback}</p>
            </article>
          );
        })}
      </div>

      <div className="checklist">
        {validation.checks.map((check) => (
          <div key={check.label} className={check.ok ? 'ok' : 'risk'}>
            {check.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>
              <strong>{check.label}</strong>
              <small>{check.detail}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function getTone(value) {
  if (value >= 80) return 'good';
  if (value >= 60) return 'warn';
  return 'bad';
}
