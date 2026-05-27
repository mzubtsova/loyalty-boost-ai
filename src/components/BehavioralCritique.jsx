import React from 'react';
import { ShieldAlert, Zap, HelpCircle } from 'lucide-react';

export default function BehavioralCritique({ critique, isLoading }) {
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        padding: '2rem',
        textAlign: 'center',
        gap: '0.75rem'
      }}>
        <div className="loader" style={{
          width: '32px',
          height: '32px',
          border: '4px solid var(--border-color)',
          borderTopColor: 'var(--accent-gold)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ fontSize: '0.875rem' }}>Analyzing campaign psychology metrics...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!critique) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        textAlign: 'center',
        padding: '2rem',
        border: '1.5px dashed var(--border-color)',
        borderRadius: 'var(--border-radius-md)'
      }}>
        <ShieldAlert size={32} style={{ marginBottom: '0.5rem' }} />
        <h4 style={{ fontSize: '0.9rem' }}>Awaiting Psychology Audit</h4>
        <p style={{ fontSize: '0.8rem', marginTop: '0.15rem', maxWidth: '260px' }}>
          Generate a promotion plan on the left to run the behavioral economics critique.
        </p>
      </div>
    );
  }

  const getScoreColorClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  const getBgClass = (score) => {
    if (score >= 80) return 'bg-high';
    if (score >= 50) return 'bg-medium';
    return 'bg-low';
  };

  const metrics = [
    {
      name: 'Loss Aversion (Urgency & FOMO)',
      score: critique.lossAversionScore,
      feedback: critique.lossAversionFeedback,
      icon: <Zap size={16} style={{ color: 'var(--accent-gold)' }} />
    },
    {
      name: 'Participation Friction (Usability)',
      score: critique.frictionScore,
      feedback: critique.frictionFeedback,
      icon: <HelpCircle size={16} style={{ color: 'var(--accent-amber)' }} />
    },
    {
      name: 'Brand Fatigue Protection (Sustained Margin)',
      score: critique.fatigueScore,
      feedback: critique.fatigueFeedback,
      icon: <ShieldAlert size={16} style={{ color: 'var(--success)' }} />
    }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {metrics.map((m, idx) => (
        <div key={idx} className="audit-metric-card">
          <div className="audit-metric-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {m.icon}
              <span className="audit-metric-name">{m.name}</span>
            </div>
            <span className={`audit-metric-score ${getScoreColorClass(m.score)}`}>
              {m.score}/100
            </span>
          </div>

          <div className="audit-metric-bar-bg">
            <div 
              className={`audit-metric-bar-fill ${getBgClass(m.score)}`} 
              style={{ width: `${m.score}%` }}
            ></div>
          </div>

          <p className="audit-metric-desc">{m.feedback}</p>
        </div>
      ))}
    </div>
  );
}
