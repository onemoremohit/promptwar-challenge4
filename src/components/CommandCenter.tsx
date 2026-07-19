// src/components/CommandCenter.tsx
import React, { useMemo, useEffect, useState } from 'react';
import type { Stadium } from '../data/stadiumData';
import { FIFA_STADIUMS } from '../data/stadiumData';
import { analyzeZoneDensity, computeStadiumOccupancy } from '../utils/crowdEngine';
import { sanitizeNumber } from '../utils/sanitizer';

/**
 * Props for the CommandCenter dashboard component.
 */
interface CommandCenterProps {
  /** Currently selected stadium */
  readonly selectedStadium: Stadium;
  /** Callback to change the active stadium */
  readonly onStadiumChange: (stadium: Stadium) => void;
  /** Current zone occupancies keyed by zone ID */
  readonly zoneOccupancies: Record<string, number>;
  /** Callback to navigate to another tab */
  readonly onNavigate: (tab: string) => void;
}

const TIER_COLORS: Record<string, string> = {
  Low:      '#10B981',
  Moderate: '#F59E0B',
  High:     '#F97316',
  Critical: '#EF4444',
};

const TIER_BG: Record<string, string> = {
  Low:      'rgba(16, 185, 129, 0.12)',
  Moderate: 'rgba(245, 158, 11, 0.12)',
  High:     'rgba(249, 115, 22, 0.12)',
  Critical: 'rgba(239, 68, 68, 0.12)',
};

/**
 * Command Center — the main operational dashboard for StadiumIQ.
 * Shows real-time stadium occupancy, AI situation brief, and quick-action navigation.
 */
const CommandCenter: React.FC<CommandCenterProps> = ({
  selectedStadium,
  onStadiumChange,
  zoneOccupancies,
  onNavigate,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const zoneResults = useMemo(() => {
    return selectedStadium.zones.map((zone) => {
      const occupancy = sanitizeNumber(zoneOccupancies[zone.id] ?? 0, 0, zone.capacity);
      return analyzeZoneDensity(zone, occupancy);
    });
  }, [selectedStadium, zoneOccupancies]);

  const summary = useMemo(() => computeStadiumOccupancy(zoneResults), [zoneResults]);

  const aiBrief = useMemo(() => {
    if (summary.overallTier === 'Critical') {
      return `⚠️ CRITICAL ALERT: ${summary.criticalZones.join(', ')} ${summary.criticalZones.length === 1 ? 'is' : 'are'} at capacity. Immediate crowd diversion required. Activate overflow protocol.`;
    }
    if (summary.overallTier === 'High') {
      return `🔶 HIGH DENSITY: Stadium is at ${summary.overallPercentage}% capacity. Deploy crowd flow staff to main concourses. Open auxiliary gates.`;
    }
    if (summary.overallTier === 'Moderate') {
      return `✅ MODERATE: Stadium operating at ${summary.overallPercentage}% — normal operations. Monitor Zone ${zoneResults.find(z => z.tier === 'High')?.zoneName ?? 'entries'} for surge patterns.`;
    }
    return `🟢 ALL CLEAR: Stadium at ${summary.overallPercentage}% capacity — optimal conditions. All systems nominal.`;
  }, [summary, zoneResults]);

  return (
    <section className="command-center" aria-label="Command Center Dashboard">
      {/* Header Row */}
      <div className="cc-header">
        <div className="cc-title-block">
          <h2 className="cc-title">⚡ Command Center</h2>
          <p className="cc-subtitle">FIFA World Cup 2026 · Live Operational Intelligence</p>
        </div>
        <div className="cc-time" aria-label={`Current time: ${currentTime.toLocaleTimeString()}`}>
          <span className="time-label">LIVE</span>
          <span className="time-display">{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stadium Selector */}
      <div className="glass-card stadium-selector-card">
        <label htmlFor="stadium-select" className="field-label">
          🏟️ Select FIFA WC 2026 Venue
        </label>
        <select
          id="stadium-select"
          className="form-select"
          value={selectedStadium.id}
          onChange={(e) => {
            const found = FIFA_STADIUMS.find((s) => s.id === e.target.value);
            if (found) onStadiumChange(found);
          }}
          aria-label="Select FIFA World Cup 2026 stadium"
        >
          {FIFA_STADIUMS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.city}, {s.country}
            </option>
          ))}
        </select>
      </div>

      {/* AI Situation Brief */}
      <div
        className="glass-card ai-brief-card"
        role="status"
        aria-live="polite"
        aria-label="AI Situation Brief"
        style={{ borderColor: TIER_COLORS[summary.overallTier] + '44', background: TIER_BG[summary.overallTier] }}
      >
        <div className="brief-header">
          <span className="brief-tag" style={{ background: TIER_COLORS[summary.overallTier] }}>
            AI BRIEF · {summary.overallTier.toUpperCase()}
          </span>
        </div>
        <p className="brief-text">{aiBrief}</p>
      </div>

      {/* KPI Metric Cards */}
      <div className="kpi-grid" role="region" aria-label="Stadium Key Metrics">
        {[
          { label: 'Total Occupancy',   value: summary.totalOccupancy.toLocaleString(), sub: `of ${summary.totalCapacity.toLocaleString()}`, color: '#60A5FA' },
          { label: 'Fill Rate',          value: `${summary.overallPercentage}%`,         sub: summary.overallTier,                            color: TIER_COLORS[summary.overallTier] },
          { label: 'Critical Zones',     value: summary.criticalZones.length.toString(), sub: `of ${selectedStadium.zones.length} zones`,     color: summary.criticalZones.length > 0 ? '#EF4444' : '#10B981' },
          { label: 'Avg Zone Density',   value: `${summary.averageDensity}%`,            sub: 'across all zones',                             color: '#A78BFA' },
          { label: 'Eco Rating',         value: `${selectedStadium.sustainabilityRating}/10`, sub: 'Sustainability Score',                    color: '#34D399' },
          { label: 'Active Zones',       value: selectedStadium.zones.length.toString(), sub: 'monitoring live',                              color: '#38BDF8' },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card glass-card" aria-label={`${kpi.label}: ${kpi.value}`}>
            <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Zone Density Table */}
      <div className="glass-card zone-table-card" role="region" aria-label="Zone Density Overview">
        <h3 className="card-title">Zone Density Overview</h3>
        <div className="zone-rows" role="list">
          {zoneResults.map((z) => (
            <div key={z.zoneId} className="zone-row" role="listitem" aria-label={`${z.zoneName}: ${z.percentage}% — ${z.tier}`}>
              <span className="zone-name">{z.zoneName}</span>
              <div className="zone-bar-track" role="progressbar" aria-valuenow={Math.round(z.percentage)} aria-valuemin={0} aria-valuemax={100} aria-label={`${z.zoneName} fill level`}>
                <div className="zone-bar-fill" style={{ width: `${z.percentage}%`, background: TIER_COLORS[z.tier] }} />
              </div>
              <span className="zone-pct" style={{ color: TIER_COLORS[z.tier] }}>{z.percentage}%</span>
              <span className="zone-tier-badge" style={{ background: TIER_BG[z.tier], color: TIER_COLORS[z.tier] }}>{z.tier}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card quick-actions-card" role="region" aria-label="Quick Actions">
        <h3 className="card-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {[
            { label: '🧭 AI Navigation',   tab: 'navigator',     desc: 'Get AI-powered directions' },
            { label: '👥 Crowd Intel',      tab: 'crowd',         desc: 'View crowd density map' },
            { label: '♿ Access & Transport', tab: 'access',      desc: 'Plan accessible routes' },
            { label: '🌍 Fan Hub',          tab: 'fanhub',        desc: 'Multilingual AI assistant' },
            { label: '👷 Staff Ops',        tab: 'staffops',      desc: 'Task board & incidents' },
          ].map((action) => (
            <button
              key={action.tab}
              className="quick-action-btn"
              onClick={() => onNavigate(action.tab)}
              aria-label={`Go to ${action.label}: ${action.desc}`}
            >
              <span className="qa-label">{action.label}</span>
              <span className="qa-desc">{action.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stadium Info */}
      <div className="glass-card stadium-info-card" role="region" aria-label="Selected Stadium Information">
        <h3 className="card-title">🏟️ {selectedStadium.name}</h3>
        <div className="stadium-info-grid">
          <div className="info-block">
            <span className="info-label">City</span>
            <span className="info-value">{selectedStadium.city}</span>
          </div>
          <div className="info-block">
            <span className="info-label">Country</span>
            <span className="info-value">{selectedStadium.country}</span>
          </div>
          <div className="info-block">
            <span className="info-label">Capacity</span>
            <span className="info-value">{selectedStadium.capacity.toLocaleString()}</span>
          </div>
          <div className="info-block">
            <span className="info-label">Eco Score</span>
            <span className="info-value" style={{ color: '#34D399' }}>{selectedStadium.sustainabilityRating}/10</span>
          </div>
        </div>
        <div className="transport-tags" aria-label="Transport options">
          <span className="info-label">Transport:</span>
          {selectedStadium.transport.map((t) => (
            <span key={t} className="transport-tag">{t}</span>
          ))}
        </div>
        <div className="a11y-tags" aria-label="Accessibility features">
          <span className="info-label">Accessibility:</span>
          {selectedStadium.accessibilityFeatures.slice(0, 3).map((f) => (
            <span key={f} className="a11y-tag">{f}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommandCenter;
