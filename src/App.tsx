// src/App.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { FIFA_STADIUMS } from './data/stadiumData';
import type { Stadium } from './data/stadiumData';
import CommandCenter from './components/CommandCenter';
import AINavigator from './components/AINavigator';
import CrowdIntelligence from './components/CrowdIntelligence';
import FanHub from './components/FanHub';
import AccessTransport from './components/AccessTransport';
import StaffOps from './components/StaffOps';
import type { DensityTier } from './utils/crowdEngine';
import { analyzeZoneDensity, computeStadiumOccupancy } from './utils/crowdEngine';
import { sanitizeNumber } from './utils/sanitizer';

/** Application tab definition */
interface AppTab {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly ariaLabel: string;
}

const TABS: readonly AppTab[] = [
  { id: 'command',  label: 'Command Center', icon: '⚡', ariaLabel: 'Command Center Dashboard'       },
  { id: 'navigator', label: 'AI Navigator', icon: '🧭', ariaLabel: 'AI Stadium Navigator'            },
  { id: 'crowd',    label: 'Crowd Intel',   icon: '👥', ariaLabel: 'Crowd Intelligence Dashboard'    },
  { id: 'fanhub',   label: 'Fan Hub',       icon: '🌍', ariaLabel: 'Multilingual Fan Hub'            },
  { id: 'access',   label: 'Access & Transport', icon: '♿', ariaLabel: 'Accessibility and Transport' },
  { id: 'staffops', label: 'Staff Ops',     icon: '👷', ariaLabel: 'Staff Operations Dashboard'      },
] as const;

/**
 * Root application component for StadiumIQ — FIFA World Cup 2026.
 * Manages global state (selected stadium, zone occupancies, active tab)
 * and renders the appropriate tabbed panel.
 */
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('command');
  const [selectedStadium, setSelectedStadium] = useState<Stadium>(FIFA_STADIUMS[0]);
  const [zoneOccupancies, setZoneOccupancies] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    FIFA_STADIUMS[0].zones.forEach((z) => {
      initial[z.id] = Math.floor(z.capacity * 0.5 + Math.random() * z.capacity * 0.3);
    });
    return initial;
  });

  /** Update the selected stadium and re-initialise zone occupancies */
  const handleStadiumChange = useCallback((stadium: Stadium) => {
    setSelectedStadium(stadium);
    const initial: Record<string, number> = {};
    stadium.zones.forEach((z) => {
      initial[z.id] = Math.floor(z.capacity * 0.45 + Math.random() * z.capacity * 0.35);
    });
    setZoneOccupancies(initial);
  }, []);

  /** Update a single zone's occupancy value */
  const handleOccupancyChange = useCallback((zoneId: string, value: number) => {
    setZoneOccupancies((prev) => ({ ...prev, [zoneId]: value }));
  }, []);

  /** Derive overall crowd tier from current zone occupancies */
  const crowdTier = useMemo((): DensityTier => {
    const zoneResults = selectedStadium.zones.map((zone) => {
      const occ = sanitizeNumber(zoneOccupancies[zone.id] ?? 0, 0, zone.capacity);
      return analyzeZoneDensity(zone, occ);
    });
    return computeStadiumOccupancy(zoneResults).overallTier;
  }, [selectedStadium, zoneOccupancies]);

  /** Navigate to a tab programmatically (used by Quick Actions) */
  const handleNavigate = useCallback((tab: string) => {
    setActiveTab(tab);
    // Scroll to top of main content
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="app-shell">
      {/* App Header */}
      <header className="app-header" role="banner">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-logo" aria-hidden="true">🏟️</span>
            <div>
              <h1 className="brand-name">StadiumIQ</h1>
              <p className="brand-tagline">FIFA World Cup 2026 · Smart Stadium Intelligence</p>
            </div>
          </div>
          <div className="header-meta" aria-label="Current stadium and crowd status">
            <span className="header-stadium">{selectedStadium.name}</span>
            <span
              className="header-crowd-chip"
              aria-label={`Crowd level: ${crowdTier}`}
              style={{
                background: crowdTier === 'Low' ? 'rgba(16,185,129,0.15)' : crowdTier === 'Moderate' ? 'rgba(245,158,11,0.15)' : crowdTier === 'High' ? 'rgba(249,115,22,0.15)' : 'rgba(239,68,68,0.15)',
                color: crowdTier === 'Low' ? '#10B981' : crowdTier === 'Moderate' ? '#F59E0B' : crowdTier === 'High' ? '#F97316' : '#EF4444',
              }}
            >
              {crowdTier === 'Low' ? '🟢' : crowdTier === 'Moderate' ? '🟡' : crowdTier === 'High' ? '🟠' : '🔴'} {crowdTier}
            </span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-nav" role="navigation" aria-label="Main application navigation">
        <div className="tab-list-wrapper">
          <div role="tablist" aria-label="StadiumIQ sections" className="tab-list">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.ariaLabel}
              >
                <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="main-content" tabIndex={-1} role="main">
        {TABS.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
            className="tab-panel"
          >
            {activeTab === tab.id && (
              <>
                {tab.id === 'command'   && <CommandCenter selectedStadium={selectedStadium} onStadiumChange={handleStadiumChange} zoneOccupancies={zoneOccupancies} onNavigate={handleNavigate} />}
                {tab.id === 'navigator' && <AINavigator selectedStadium={selectedStadium} crowdTier={crowdTier} />}
                {tab.id === 'crowd'     && <CrowdIntelligence selectedStadium={selectedStadium} zoneOccupancies={zoneOccupancies} onOccupancyChange={handleOccupancyChange} />}
                {tab.id === 'fanhub'    && <FanHub selectedStadium={selectedStadium} />}
                {tab.id === 'access'    && <AccessTransport selectedStadium={selectedStadium} />}
                {tab.id === 'staffops'  && <StaffOps selectedStadium={selectedStadium} />}
              </>
            )}
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="app-footer" role="contentinfo">
        <p>StadiumIQ · FIFA World Cup 2026 · GenAI-Powered Smart Stadium Intelligence · Built with Google AI</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 4 }}>
          Data sources: FIFA Official · IEA World Energy 2024 · IPCC AR6 · Stadium capacity data via FIFA.com
        </p>
      </footer>
    </div>
  );
};

export default App;
