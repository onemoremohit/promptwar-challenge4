// src/components/AccessTransport.tsx
import React, { useState, useMemo } from 'react';
import type { Stadium } from '../data/stadiumData';

interface AccessTransportProps {
  readonly selectedStadium: Stadium;
}

const SHUTTLE_TIMES = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '16:30', '18:00', '20:00'];

type MobilityNeed = 'none' | 'wheelchair' | 'visual' | 'hearing' | 'cognitive';

const MOBILITY_LABELS: Record<MobilityNeed, string> = {
  none: '🚶 Standard Access',
  wheelchair: '♿ Wheelchair / Mobility Aid',
  visual: '👁️ Visual Impairment',
  hearing: '🦻 Hearing Impairment',
  cognitive: '🧠 Cognitive / Sensory Needs',
};

const ROUTES: Record<MobilityNeed, { steps: string[]; tip: string }> = {
  none: {
    steps: ['Enter via Gate A or B (general admission)', 'Follow color-coded floor markers to your section', 'Use stairs or escalators to reach your level', 'Concessions on every level'],
    tip: 'Arrive 90+ minutes early to avoid queue congestion.',
  },
  wheelchair: {
    steps: ['Use accessible entrance at Gate A-North (ramp, no steps)', 'Level 1 pathway is 100% step-free throughout', 'Elevators available at all section boundaries', 'Accessible restrooms every 50m on Level 1', 'Dedicated viewing spaces at Rows 1 and 8'],
    tip: 'Request a companion space at the accessibility desk near Gate A.',
  },
  visual: {
    steps: ['Sighted guide service available at Gate A accessibility desk', 'Tactile floor paths installed throughout Level 1', 'Audio wayfinding beacons at all major junctions', 'Braille seat locators on all armrests', 'Audio match commentary available via stadium app'],
    tip: 'Download the StadiumIQ app for audio-guided navigation before you arrive.',
  },
  hearing: {
    steps: ['Induction loop system active in all seating areas', 'Visual emergency alerts on all screens', 'BSL/ASL interpreter stations at Gates A and D', 'Vibrating match event alerts via stadium app', 'Captioned screens in all concourse areas'],
    tip: 'Enable Bluetooth on your hearing aid — our loop system is compatible.',
  },
  cognitive: {
    steps: ['Quiet entry lanes available at Gate C (minimal crowding)', 'Sensory room located on Level 1, Section B (reserved, low-stimulus)', 'Visual schedule maps at every entrance', 'Dedicated calm volunteers wear yellow vests', 'Noise-reducing earplugs available at info desks'],
    tip: 'Request a sensory kit (earplugs, fidget tools, schedule card) at any info desk.',
  },
};

/**
 * Access & Transport — accessible route planning, shuttle tracker, and transport info.
 */
const AccessTransport: React.FC<AccessTransportProps> = ({ selectedStadium }) => {
  const [mobilityNeed, setMobilityNeed] = useState<MobilityNeed>('none');
  const [selectedTime, setSelectedTime] = useState('');

  const aiRoute = useMemo(() => ROUTES[mobilityNeed], [mobilityNeed]);

  const nextShuttles = useMemo(() => {
    const now = new Date();
    const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const upcoming = SHUTTLE_TIMES.filter((t) => t > currentHHMM);
    return upcoming.slice(0, 4);
  }, []);

  return (
    <section className="access-transport" aria-label="Accessibility and Transport Hub">
      <div className="nav-header">
        <div>
          <h2 className="section-title">♿ Access & Transport</h2>
          <p className="section-sub">AI-powered route planning and transport tracking for {selectedStadium.name}</p>
        </div>
      </div>

      {/* Mobility Need Selector */}
      <div className="glass-card mobility-selector-card">
        <h3 className="card-title">🤖 AI Route Planner</h3>
        <p className="card-desc">Select your mobility needs to get a personalised accessible route:</p>
        <div className="mobility-grid" role="group" aria-label="Select mobility need">
          {(Object.keys(MOBILITY_LABELS) as MobilityNeed[]).map((need) => (
            <button
              key={need}
              className={`mobility-btn ${mobilityNeed === need ? 'active' : ''}`}
              onClick={() => setMobilityNeed(need)}
              role="radio"
              aria-checked={mobilityNeed === need}
              aria-label={MOBILITY_LABELS[need]}
            >
              {MOBILITY_LABELS[need]}
            </button>
          ))}
        </div>
      </div>

      {/* AI Route Result */}
      <div className="glass-card ai-route-card" role="region" aria-label={`Accessible route for ${MOBILITY_LABELS[mobilityNeed]}`} style={{ borderColor: '#10B98133' }}>
        <div className="route-header">
          <h3 className="card-title">📍 Your Personalised Route</h3>
          <span className="ai-badge">🤖 AI Generated</span>
        </div>
        <ol className="route-steps" aria-label="Step-by-step accessible route">
          {aiRoute.steps.map((step, i) => (
            <li key={i} className="route-step">
              <span className="step-num" aria-hidden="true">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="route-tip" role="note" aria-label="AI Tip">
          <span className="tip-icon" aria-hidden="true">💡</span>
          <strong>AI Tip:</strong> {aiRoute.tip}
        </div>
      </div>

      {/* Shuttle Tracker */}
      <div className="glass-card shuttle-card" role="region" aria-label="Shuttle Bus Tracker">
        <h3 className="card-title">🚌 Live Shuttle Tracker</h3>
        <p className="card-desc">Departures from {selectedStadium.name} South Plaza</p>
        <div className="shuttle-grid">
          {nextShuttles.length > 0 ? nextShuttles.map((time, i) => (
            <div key={time} className={`shuttle-slot ${i === 0 ? 'next' : ''}`} aria-label={`Shuttle ${i === 0 ? 'next departure' : 'departure'} at ${time}`}>
              <span className="shuttle-time">{time}</span>
              <span className="shuttle-status">{i === 0 ? '🟢 NEXT' : '🔵 Scheduled'}</span>
              <span className="shuttle-note">{i === 0 ? 'Boarding now' : `~${(i * 30)}min`}</span>
            </div>
          )) : (
            <p className="no-shuttle" role="status">No more shuttles today. Service resumes tomorrow at 08:30.</p>
          )}
        </div>
        <div className="shuttle-accessible">
          <span className="a11y-tag" style={{ fontSize: '0.8rem' }}>♿ Accessible shuttles available — ask staff at plaza</span>
        </div>
      </div>

      {/* Transport Options */}
      <div className="glass-card transport-card" role="region" aria-label="All transport options">
        <h3 className="card-title">🗺️ Getting Here — All Transport</h3>
        <div className="transport-list" role="list">
          {selectedStadium.transport.map((t) => (
            <div key={t} className="transport-item" role="listitem">
              <span className="transport-icon" aria-hidden="true">🚊</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="glass-card a11y-features-card" role="region" aria-label="Stadium accessibility features">
        <h3 className="card-title">♿ Accessibility Features</h3>
        <div className="a11y-features-list" role="list">
          {selectedStadium.accessibilityFeatures.map((f) => (
            <div key={f} className="a11y-feature-item" role="listitem">
              <span className="check-icon" style={{ color: '#10B981' }} aria-hidden="true">✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Book Accessible Assistance */}
      <div className="glass-card assist-card" role="region" aria-label="Book accessible assistance">
        <h3 className="card-title">📞 Request Accessible Assistance</h3>
        <p className="card-desc">Choose your arrival time and we'll have a staff member ready to assist you at Gate A.</p>
        <div className="time-picker-row">
          <label htmlFor="arrival-time" className="field-label">Planned Arrival Time</label>
          <select
            id="arrival-time"
            className="form-select"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            aria-label="Select your arrival time for assistance"
          >
            <option value="">Select time…</option>
            {SHUTTLE_TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {selectedTime && (
          <div className="assist-confirm" role="status" aria-live="polite" aria-label={`Assistance confirmed for ${selectedTime}`}>
            ✅ Assistance request noted for <strong>{selectedTime}</strong>. A yellow-vested volunteer will meet you at Gate A-North.
          </div>
        )}
      </div>
    </section>
  );
};

export default AccessTransport;
