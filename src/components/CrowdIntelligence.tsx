// src/components/CrowdIntelligence.tsx
import React, { useMemo, useCallback, useState } from 'react';
import type { Stadium } from '../data/stadiumData';
import { analyzeZoneDensity, computeStadiumOccupancy, predictCrowdSurge, generateEvacuationPlan } from '../utils/crowdEngine';
import { sanitizeNumber } from '../utils/sanitizer';

interface CrowdIntelligenceProps {
  readonly selectedStadium: Stadium;
  readonly zoneOccupancies: Record<string, number>;
  readonly onOccupancyChange: (zoneId: string, value: number) => void;
}

const TIER_COLORS: Record<string, string> = {
  Low: '#10B981', Moderate: '#F59E0B', High: '#F97316', Critical: '#EF4444',
};
const TIER_BG: Record<string, string> = {
  Low: 'rgba(16,185,129,0.1)', Moderate: 'rgba(245,158,11,0.1)', High: 'rgba(249,115,22,0.1)', Critical: 'rgba(239,68,68,0.1)',
};

/**
 * Crowd Intelligence — real-time zone density map, surge predictions, and evacuation planning.
 */
const CrowdIntelligence: React.FC<CrowdIntelligenceProps> = ({
  selectedStadium, zoneOccupancies, onOccupancyChange,
}) => {
  const [showEvac, setShowEvac] = useState(false);
  const [evacTriggerZone, setEvacTriggerZone] = useState<string>('');

  const zoneResults = useMemo(() => {
    return selectedStadium.zones.map((zone) => {
      const occ = sanitizeNumber(zoneOccupancies[zone.id] ?? Math.floor(zone.capacity * 0.5), 0, zone.capacity);
      return analyzeZoneDensity(zone, occ);
    });
  }, [selectedStadium, zoneOccupancies]);

  const summary = useMemo(() => computeStadiumOccupancy(zoneResults), [zoneResults]);

  const surgePrediction = useMemo(() => predictCrowdSurge(summary.overallPercentage), [summary]);

  const evacuationPlan = useMemo(() => {
    if (!showEvac || !evacTriggerZone) return null;
    return generateEvacuationPlan(evacTriggerZone, zoneResults);
  }, [showEvac, evacTriggerZone, zoneResults]);

  const handleSliderChange = useCallback((zoneId: string, rawVal: number, capacity: number) => {
    const safe = sanitizeNumber(rawVal, 0, capacity);
    onOccupancyChange(zoneId, safe);
  }, [onOccupancyChange]);

  const triggerEvacuation = useCallback((zoneId: string) => {
    setEvacTriggerZone(zoneId);
    setShowEvac(true);
  }, []);

  return (
    <section className="crowd-intelligence" aria-label="Crowd Intelligence Dashboard">
      <div className="nav-header">
        <div>
          <h2 className="section-title">👥 Crowd Intelligence</h2>
          <p className="section-sub">Real-time density monitoring and AI evacuation planning for {selectedStadium.name}</p>
        </div>
        <div className="crowd-status-badge" style={{ background: TIER_BG[summary.overallTier], color: TIER_COLORS[summary.overallTier], border: `1px solid ${TIER_COLORS[summary.overallTier]}44` }}>
          <span className="status-dot" style={{ background: TIER_COLORS[summary.overallTier] }} aria-hidden="true" />
          {summary.overallTier} · {summary.overallPercentage}%
        </div>
      </div>

      {/* Surge Prediction Banner */}
      {surgePrediction.surgeAlert && (
        <div className="surge-alert glass-card" role="alert" aria-live="assertive" style={{ borderColor: '#F9731644', background: 'rgba(249,115,22,0.08)' }}>
          <strong>⚠️ AI Surge Alert:</strong> {surgePrediction.actionRequired}
          {surgePrediction.minutesUntilCritical && (
            <span style={{ marginLeft: 8, color: '#EF4444' }}>
              · Critical in ~{surgePrediction.minutesUntilCritical} min
            </span>
          )}
        </div>
      )}

      {/* Zone Grid — interactive density controls */}
      <div className="zone-density-grid" role="region" aria-label="Zone density controls">
        {zoneResults.map((z, idx) => {
          const zone = selectedStadium.zones[idx];
          return (
            <div key={z.zoneId} className="zone-density-card glass-card" style={{ borderColor: TIER_COLORS[z.tier] + '33' }} aria-label={`Zone ${z.zoneName}: ${z.percentage}% full, status ${z.tier}`}>
              <div className="zdc-header">
                <span className="zone-name-badge" style={{ background: TIER_BG[z.tier], color: TIER_COLORS[z.tier] }}>
                  Zone {z.zoneId}
                </span>
                <span className="zone-tier-label" style={{ color: TIER_COLORS[z.tier] }}>{z.tier}</span>
              </div>
              <h4 className="zdc-name">{z.zoneName}</h4>
              <div className="zdc-stats">
                <span>{z.occupancy.toLocaleString()} / {z.capacity.toLocaleString()}</span>
                <span style={{ color: TIER_COLORS[z.tier], fontWeight: 700 }}>{z.percentage}%</span>
              </div>
              <div className="zone-bar-track" role="progressbar" aria-valuenow={Math.round(z.percentage)} aria-valuemin={0} aria-valuemax={100} aria-label={`${z.zoneName} occupancy`}>
                <div className="zone-bar-fill" style={{ width: `${z.percentage}%`, background: TIER_COLORS[z.tier], transition: 'width 0.5s ease' }} />
              </div>
              {/* Slider to simulate crowd changes */}
              <div className="slider-container" style={{ marginTop: 10 }}>
                <label htmlFor={`occ-${z.zoneId}`} className="sr-only">
                  Set occupancy for {z.zoneName}
                </label>
                <input
                  id={`occ-${z.zoneId}`}
                  type="range"
                  className="input-slider"
                  min={0}
                  max={zone.capacity}
                  value={zoneOccupancies[z.zoneId] ?? Math.floor(zone.capacity * 0.5)}
                  onChange={(e) => handleSliderChange(z.zoneId, Number(e.target.value), zone.capacity)}
                  aria-label={`Simulate occupancy for ${z.zoneName}`}
                  aria-valuenow={zoneOccupancies[z.zoneId] ?? Math.floor(zone.capacity * 0.5)}
                  aria-valuemin={0}
                  aria-valuemax={zone.capacity}
                />
              </div>
              <p className="zdc-rec">{z.recommendation.slice(z.zoneName.length + 4)}</p>
              {/* Evac trigger button for critical zones */}
              <button
                className="evac-trigger-btn"
                onClick={() => triggerEvacuation(z.zoneId)}
                aria-label={`Generate evacuation plan for ${z.zoneName}`}
                style={{ background: z.tier === 'Critical' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', color: z.tier === 'Critical' ? '#EF4444' : 'var(--text-muted)' }}
              >
                🚨 Generate Evac Plan
              </button>
            </div>
          );
        })}
      </div>

      {/* Evacuation Plan Modal / Panel */}
      {showEvac && evacuationPlan && (
        <div className="evac-plan glass-card" role="dialog" aria-modal="true" aria-label="AI Evacuation Plan" style={{ borderColor: '#EF444444' }}>
          <div className="evac-header">
            <h3>🚨 AI Evacuation Plan — Zone {evacTriggerZone}</h3>
            <button
              onClick={() => setShowEvac(false)}
              className="close-btn"
              aria-label="Close evacuation plan"
            >✕</button>
          </div>
          <div className="evac-broadcast" role="alert" aria-live="assertive">
            <strong>📢 Broadcast Message:</strong>
            <p>{evacuationPlan.broadcastMessage}</p>
          </div>
          <div className="evac-details">
            <div className="evac-stat">
              <span className="evac-label">Est. Evacuation Time</span>
              <span className="evac-value" style={{ color: '#EF4444' }}>~{evacuationPlan.estimatedEvacuationMinutes} min</span>
            </div>
            <div className="evac-stat">
              <span className="evac-label">Recommended Exits</span>
              <div>
                {evacuationPlan.recommendedExits.map((e, i) => (
                  <div key={i} className="evac-exit-tag">{e}</div>
                ))}
              </div>
            </div>
            <div className="evac-stat">
              <span className="evac-label">Priority Evacuation Order</span>
              <ol className="priority-list">
                {evacuationPlan.priorityOrder.map((zone, i) => (
                  <li key={i}>{zone}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Global Summary */}
      <div className="glass-card crowd-summary-card" role="region" aria-label="Crowd Summary">
        <h3 className="card-title">Stadium Summary</h3>
        <div className="summary-stats">
          <div className="ss-item">
            <span className="ss-label">Total Occupancy</span>
            <span className="ss-value">{summary.totalOccupancy.toLocaleString()} / {summary.totalCapacity.toLocaleString()}</span>
          </div>
          <div className="ss-item">
            <span className="ss-label">Fill Rate</span>
            <span className="ss-value" style={{ color: TIER_COLORS[summary.overallTier] }}>{summary.overallPercentage}%</span>
          </div>
          <div className="ss-item">
            <span className="ss-label">20-min Forecast</span>
            <span className="ss-value" style={{ color: surgePrediction.surgeAlert ? '#EF4444' : '#10B981' }}>{surgePrediction.predictedPercentage}%</span>
          </div>
          <div className="ss-item">
            <span className="ss-label">Critical Zones</span>
            <span className="ss-value" style={{ color: summary.criticalZones.length > 0 ? '#EF4444' : '#10B981' }}>
              {summary.criticalZones.length > 0 ? summary.criticalZones.join(', ') : 'None'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CrowdIntelligence;
