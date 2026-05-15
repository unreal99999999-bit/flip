import React from 'react';

const STEPS = ['Address', 'Order Summary', 'Payment'];

export default function ProgressBar({ step }) {
  const pct = step === 0 ? 16 : step === 1 ? 50 : 100;
  return (
    <div className="card py-2">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-labels">
        {STEPS.map((s, i) => (
          <span key={s} className={i === step ? 'active-step' : ''}>{s}</span>
        ))}
      </div>
    </div>
  );
}
