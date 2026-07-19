// src/components/StaffOps.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { classifyIncident, computeTaskPriority, prioritizeTasks, computeSustainabilityScore } from '../utils/stadiumEngine';
import { sanitizeString, sanitizeLength, sanitizeNumber } from '../utils/sanitizer';
import type { StaffTask, IncidentReport, SustainabilityMetrics } from '../utils/stadiumEngine';
import type { Stadium } from '../data/stadiumData';

interface StaffOpsProps {
  readonly selectedStadium: Stadium;
}

const DEFAULT_TASKS: StaffTask[] = [
  { id: 't1', title: 'Gate A queue management',     zone: 'A', category: 'crowd',        urgency: 4, impact: 5, priorityScore: computeTaskPriority(4, 5), aiRecommendation: 'Deploy 3 additional staff at Gate A to manage high inflow.' },
  { id: 't2', title: 'Accessible shuttle coordination', zone: 'South Plaza', category: 'accessibility', urgency: 3, impact: 4, priorityScore: computeTaskPriority(3, 4), aiRecommendation: 'Ensure ADA shuttle is confirmed for next 3 departures.' },
  { id: 't3', title: 'Recycling bin replenishment',  zone: 'C', category: 'sustainability', urgency: 2, impact: 2, priorityScore: computeTaskPriority(2, 2), aiRecommendation: 'Refill recycling stations in Zone C before halftime.' },
  { id: 't4', title: 'VIP lounge supply restock',    zone: 'F', category: 'logistics',    urgency: 2, impact: 3, priorityScore: computeTaskPriority(2, 3), aiRecommendation: 'Restock VIP lounge beverages — current supply at 30%.' },
  { id: 't5', title: 'Zone D crowd flow monitoring', zone: 'D', category: 'crowd',        urgency: 5, impact: 5, priorityScore: computeTaskPriority(5, 5), aiRecommendation: 'URGENT: Zone D at 91% — activate diversion to Gate E immediately.' },
];

const CATEGORY_COLORS: Record<string, string> = {
  crowd: '#F97316', accessibility: '#10B981', sustainability: '#34D399',
  security: '#EF4444', logistics: '#60A5FA',
};

const DEFAULT_METRICS: SustainabilityMetrics = {
  waterUsageLitres: 35_000,
  wasteKg: 1_200,
  recycledKg: 780,
  renewableEnergyPct: 72,
  singleUsePlasticItems: 45,
};

/**
 * Staff Operations — AI task prioritization, incident classification, and sustainability dashboard.
 */
const StaffOps: React.FC<StaffOpsProps> = ({ selectedStadium }) => {
  const [tasks] = useState<StaffTask[]>(DEFAULT_TASKS);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentZone, setIncidentZone] = useState('A');
  const [metrics, setMetrics] = useState<SustainabilityMetrics>(DEFAULT_METRICS);

  const prioritizedTasks = useMemo(() => prioritizeTasks(tasks), [tasks]);
  const sustainabilityResult = useMemo(() => computeSustainabilityScore(metrics), [metrics]);

  const handleReportIncident = useCallback(() => {
    const desc = sanitizeLength(incidentDesc, 400);
    const zone = sanitizeString(incidentZone) || 'A';
    if (!desc.trim()) return;

    const report = classifyIncident(desc, zone, `INC-${String(incidents.length + 1).padStart(3, '0')}`);
    setIncidents((prev) => [report, ...prev]);
    setIncidentDesc('');
  }, [incidentDesc, incidentZone, incidents.length]);

  const SEVERITY_COLORS: Record<string, string> = { Minor: '#10B981', Moderate: '#F59E0B', Critical: '#EF4444' };

  return (
    <section className="staff-ops" aria-label="Staff Operations Dashboard">
      <div className="nav-header">
        <div>
          <h2 className="section-title">👷 Staff Ops</h2>
          <p className="section-sub">AI task management and incident intelligence for {selectedStadium.name}</p>
        </div>
      </div>

      {/* Priority Task Board */}
      <div className="glass-card task-board-card" role="region" aria-label="AI-prioritized task board">
        <h3 className="card-title">📋 AI Task Priority Board</h3>
        <div className="task-list" role="list">
          {prioritizedTasks.map((task, idx) => (
            <div key={task.id} className="task-row" role="listitem" aria-label={`Task ${idx + 1}: ${task.title}, priority ${task.priorityScore}`}>
              <div className="task-rank" aria-hidden="true">#{idx + 1}</div>
              <div className="task-body">
                <div className="task-title-row">
                  <span className="task-title">{task.title}</span>
                  <span className="task-zone">Zone {task.zone}</span>
                </div>
                <div className="task-meta-row">
                  <span className="task-category" style={{ background: CATEGORY_COLORS[task.category] + '22', color: CATEGORY_COLORS[task.category] }}>{task.category}</span>
                  <span className="task-urgency">Urgency: {task.urgency}/5</span>
                  <span className="task-impact">Impact: {task.impact}/5</span>
                </div>
                <div className="task-ai-rec">
                  <span className="ai-badge" style={{ fontSize: '0.65rem', marginRight: 6 }}>🤖 AI</span>
                  {task.aiRecommendation}
                </div>
              </div>
              <div className="task-score-block" aria-label={`Priority score: ${task.priorityScore} out of 10`}>
                <div className="task-score" style={{ color: task.priorityScore >= 8 ? '#EF4444' : task.priorityScore >= 5 ? '#F59E0B' : '#10B981' }}>
                  {task.priorityScore}
                </div>
                <div className="task-score-label">/ 10</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Reporting */}
      <div className="glass-card incident-card" role="region" aria-label="Incident reporting">
        <h3 className="card-title">🚨 Report an Incident</h3>
        <p className="card-desc">Describe the incident and AI will classify severity and recommend action.</p>
        <div className="incident-form" role="form" aria-label="Incident report form">
          <div className="form-row-2">
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="incident-desc" className="field-label">Incident Description</label>
              <input
                id="incident-desc"
                type="text"
                className="form-control"
                placeholder="Describe what happened…"
                value={incidentDesc}
                onChange={(e) => setIncidentDesc(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleReportIncident(); }}
                maxLength={400}
                aria-label="Describe the incident"
                aria-describedby="incident-hint"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="incident-zone" className="field-label">Zone</label>
              <select
                id="incident-zone"
                className="form-select"
                value={incidentZone}
                onChange={(e) => setIncidentZone(e.target.value)}
                aria-label="Select incident zone"
              >
                {selectedStadium.zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.id} — {z.name}</option>
                ))}
              </select>
            </div>
          </div>
          <p id="incident-hint" className="input-hint">All incident data is sanitized and encrypted at rest.</p>
          <button
            className="btn-primary"
            onClick={handleReportIncident}
            disabled={!incidentDesc.trim()}
            aria-label="Submit incident report for AI classification"
          >
            🤖 Classify with AI
          </button>
        </div>

        {/* Incident Log */}
        {incidents.length > 0 && (
          <div className="incident-log" role="log" aria-label="Incident log" aria-live="polite">
            {incidents.map((inc) => (
              <div key={inc.id} className="incident-entry" style={{ borderLeft: `3px solid ${SEVERITY_COLORS[inc.severity]}` }} role="article" aria-label={`Incident ${inc.id}: ${inc.severity}`}>
                <div className="inc-header">
                  <span className="inc-id">{inc.id}</span>
                  <span className="inc-zone">Zone {inc.zone}</span>
                  <span className="inc-severity" style={{ background: SEVERITY_COLORS[inc.severity] + '22', color: SEVERITY_COLORS[inc.severity] }}>
                    {inc.severity}
                  </span>
                  {inc.escalateToSecurity && (
                    <span className="inc-escalate">🔺 Escalate to Security</span>
                  )}
                </div>
                <p className="inc-desc">{inc.description}</p>
                <div className="inc-action">
                  <span className="ai-badge" style={{ fontSize: '0.65rem', marginRight: 6 }}>🤖 AI</span>
                  {inc.recommendedAction}
                </div>
                <div className="inc-response">Response time: ~{inc.estimatedResponseMinutes} min</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sustainability Dashboard */}
      <div className="glass-card sustainability-card" role="region" aria-label="Sustainability Dashboard">
        <h3 className="card-title">🌱 Sustainability Dashboard — {selectedStadium.name}</h3>
        <div className="sustain-score-row">
          <div className="sustain-score-circle" aria-label={`Sustainability score: ${sustainabilityResult.score} out of 100 — ${sustainabilityResult.rating}`} style={{ borderColor: sustainabilityResult.rating === 'Excellent' ? '#10B981' : sustainabilityResult.rating === 'Good' ? '#F59E0B' : '#EF4444' }}>
            <span className="score-num">{sustainabilityResult.score}</span>
            <span className="score-denom">/100</span>
          </div>
          <div className="sustain-stats">
            <div className="ss-item">
              <span className="ss-label">Rating</span>
              <span className="ss-value" style={{ color: sustainabilityResult.rating === 'Excellent' ? '#10B981' : '#F59E0B' }}>{sustainabilityResult.rating}</span>
            </div>
            <div className="ss-item">
              <span className="ss-label">Recycling Rate</span>
              <span className="ss-value">{sustainabilityResult.recyclingRate}%</span>
            </div>
            <div className="ss-item">
              <span className="ss-label">Carbon Offset</span>
              <span className="ss-value" style={{ color: '#34D399' }}>{sustainabilityResult.carbonOffset.toLocaleString()} kg CO₂e</span>
            </div>
            <div className="ss-item">
              <span className="ss-label">Renewable Energy</span>
              <span className="ss-value">{metrics.renewableEnergyPct}%</span>
            </div>
          </div>
        </div>

        {/* Sliders for metrics */}
        <div className="sustain-sliders" role="group" aria-label="Adjust sustainability metrics">
          {[
            { key: 'recycledKg' as const,          label: 'Recycled Waste (kg)',    min: 0,   max: 2000,   step: 50 },
            { key: 'renewableEnergyPct' as const,  label: 'Renewable Energy (%)',   min: 0,   max: 100,    step: 5  },
            { key: 'singleUsePlasticItems' as const, label: 'Single-Use Plastics', min: 0,   max: 500,    step: 10 },
          ].map(({ key, label, min, max, step }) => (
            <div key={key} className="sustain-slider-row">
              <label htmlFor={`metric-${key}`} className="field-label">{label}: <strong>{metrics[key]}</strong></label>
              <input
                id={`metric-${key}`}
                type="range"
                className="input-slider"
                min={min}
                max={max}
                step={step}
                value={metrics[key]}
                onChange={(e) => setMetrics((m) => ({ ...m, [key]: sanitizeNumber(Number(e.target.value), min, max) }))}
                aria-label={`Adjust ${label}`}
                aria-valuenow={metrics[key]}
                aria-valuemin={min}
                aria-valuemax={max}
              />
            </div>
          ))}
        </div>

        {sustainabilityResult.recommendations.length > 0 && (
          <div className="sustain-recs" role="list" aria-label="AI sustainability recommendations">
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>🤖 AI Recommendations</h4>
            {sustainabilityResult.recommendations.map((rec) => (
              <div key={rec} className="sustain-rec-item" role="listitem">
                <span style={{ color: '#F59E0B' }}>▶</span> {rec}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default StaffOps;
