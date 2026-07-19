// src/utils/crowdEngine.ts
/**
 * @file crowdEngine.ts
 * @description GenAI-powered crowd intelligence engine for FIFA World Cup 2026 stadiums.
 * Computes zone density, predicts crowd surges, generates evacuation plans,
 * and produces actionable operational recommendations for stadium staff.
 *
 * @module crowdEngine
 */

import type { StadiumZone } from '../data/stadiumData';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Percentage threshold below which a zone is classified as Low density */
export const LOW_DENSITY_THRESHOLD = 60;

/** Percentage threshold below which a zone is Moderate (≥60 and <80) */
export const MODERATE_DENSITY_THRESHOLD = 80;

/** Percentage threshold below which a zone is High (≥80 and <95) */
export const HIGH_DENSITY_THRESHOLD = 95;

/** Crowd surge acceleration factor per minute under active inflow */
export const SURGE_RATE_PER_MINUTE = 0.8;

/** Maximum realistic crowd density percentage (100% = full capacity) */
export const MAX_DENSITY_PERCENT = 100;

/** Minimum recommended density for opening additional gates (%) */
export const GATE_OPEN_TRIGGER = 70;

// ─── Types ────────────────────────────────────────────────────────────────────

/** Crowd density tier classifications */
export type DensityTier = 'Low' | 'Moderate' | 'High' | 'Critical';

/** Result of analysing a single zone's crowd density */
export interface ZoneDensityResult {
  readonly zoneId: string;
  readonly zoneName: string;
  readonly occupancy: number;
  readonly capacity: number;
  readonly percentage: number;
  readonly tier: DensityTier;
  readonly recommendation: string;
}

/** Aggregated stadium-wide occupancy summary */
export interface StadiumOccupancySummary {
  readonly totalOccupancy: number;
  readonly totalCapacity: number;
  readonly overallPercentage: number;
  readonly overallTier: DensityTier;
  readonly criticalZones: readonly string[];
  readonly averageDensity: number;
}

/** AI-generated evacuation plan for a stadium emergency */
export interface EvacuationPlan {
  readonly triggerZone: string;
  readonly estimatedEvacuationMinutes: number;
  readonly recommendedExits: readonly string[];
  readonly priorityOrder: readonly string[];
  readonly broadcastMessage: string;
}

/** Prediction of crowd density at a future time */
export interface CrowdSurgePrediction {
  readonly currentPercentage: number;
  readonly predictedPercentage: number;
  readonly minutesUntilCritical: number | null;
  readonly surgeAlert: boolean;
  readonly actionRequired: string;
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Classifies a density percentage into one of four crowd tiers.
 *
 * @param percentage - Current occupancy as a percentage (0–100)
 * @returns The corresponding {@link DensityTier}
 *
 * @example
 * ```ts
 * getCrowdTier(45);  // → 'Low'
 * getCrowdTier(72);  // → 'Moderate'
 * getCrowdTier(88);  // → 'High'
 * getCrowdTier(97);  // → 'Critical'
 * ```
 */
export function getCrowdTier(percentage: number): DensityTier {
  if (percentage < LOW_DENSITY_THRESHOLD) return 'Low';
  if (percentage < MODERATE_DENSITY_THRESHOLD) return 'Moderate';
  if (percentage < HIGH_DENSITY_THRESHOLD) return 'High';
  return 'Critical';
}

/**
 * Generates a human-readable, actionable recommendation for a zone
 * based on its current density tier.
 *
 * @param tier     - The zone's current density classification
 * @param zoneName - Display name of the zone for messaging
 * @returns A staff recommendation string
 */
export function getZoneRecommendation(tier: DensityTier, zoneName: string): string {
  const RECOMMENDATIONS: Record<DensityTier, string> = {
    Low:      `${zoneName} is below 60% — standard operations, no action needed.`,
    Moderate: `${zoneName} is 60–80% — monitor entry queues and open auxiliary concessions.`,
    High:     `${zoneName} is 80–95% — activate crowd flow staff, slow gate admissions.`,
    Critical: `${zoneName} is above 95% — CRITICAL: halt admissions, activate overflow protocol.`,
  };
  return RECOMMENDATIONS[tier];
}

/**
 * Analyses a stadium zone's current occupancy and returns a full density result.
 *
 * @param zone      - The zone configuration from stadium data
 * @param occupancy - Current number of people in the zone
 * @returns A {@link ZoneDensityResult} with tier and recommendation
 *
 * @example
 * ```ts
 * const zone = { id: 'A', name: 'North Stand', capacity: 18000, ... };
 * analyzeZoneDensity(zone, 15000); // → { percentage: 83.3, tier: 'High', ... }
 * ```
 */
export function analyzeZoneDensity(zone: StadiumZone, occupancy: number): ZoneDensityResult {
  const safeOccupancy = Math.min(Math.max(0, occupancy), zone.capacity);
  const percentage = parseFloat(((safeOccupancy / zone.capacity) * 100).toFixed(1));
  const tier = getCrowdTier(percentage);
  return {
    zoneId: zone.id,
    zoneName: zone.name,
    occupancy: safeOccupancy,
    capacity: zone.capacity,
    percentage,
    tier,
    recommendation: getZoneRecommendation(tier, zone.name),
  };
}

/**
 * Computes the aggregated stadium-wide occupancy summary from individual zone results.
 *
 * @param zoneResults - Array of individual zone density analyses
 * @returns A {@link StadiumOccupancySummary} with overall stats and critical zone list
 */
export function computeStadiumOccupancy(zoneResults: readonly ZoneDensityResult[]): StadiumOccupancySummary {
  if (zoneResults.length === 0) {
    return {
      totalOccupancy: 0,
      totalCapacity: 0,
      overallPercentage: 0,
      overallTier: 'Low',
      criticalZones: [],
      averageDensity: 0,
    };
  }

  const totalOccupancy = zoneResults.reduce((sum, z) => sum + z.occupancy, 0);
  const totalCapacity  = zoneResults.reduce((sum, z) => sum + z.capacity, 0);
  const overallPercentage = parseFloat(((totalOccupancy / totalCapacity) * 100).toFixed(1));
  const criticalZones = zoneResults.filter((z) => z.tier === 'Critical').map((z) => z.zoneName);
  const averageDensity = parseFloat(
    (zoneResults.reduce((sum, z) => sum + z.percentage, 0) / zoneResults.length).toFixed(1)
  );

  return {
    totalOccupancy,
    totalCapacity,
    overallPercentage,
    overallTier: getCrowdTier(overallPercentage),
    criticalZones,
    averageDensity,
  };
}

/**
 * Predicts future crowd density using a linear surge model.
 * Assumes a constant inflow rate and calculates time until critical threshold.
 *
 * @param currentPercentage  - Current zone occupancy percentage (0–100)
 * @param inflowRatePerMin   - Estimated new fans entering per minute (as a % of capacity)
 * @returns A {@link CrowdSurgePrediction} with alert and projected density
 *
 * @example
 * ```ts
 * predictCrowdSurge(78, 0.8); // → { predictedPercentage: 94, surgeAlert: true, ... }
 * ```
 */
export function predictCrowdSurge(
  currentPercentage: number,
  inflowRatePerMin: number = SURGE_RATE_PER_MINUTE
): CrowdSurgePrediction {
  const LOOK_AHEAD_MINUTES = 20;
  const predictedPercentage = Math.min(
    parseFloat((currentPercentage + inflowRatePerMin * LOOK_AHEAD_MINUTES).toFixed(1)),
    MAX_DENSITY_PERCENT
  );

  let minutesUntilCritical: number | null = null;
  if (currentPercentage < HIGH_DENSITY_THRESHOLD && inflowRatePerMin > 0) {
    const gap = HIGH_DENSITY_THRESHOLD - currentPercentage;
    minutesUntilCritical = Math.ceil(gap / inflowRatePerMin);
  }

  const surgeAlert = predictedPercentage >= HIGH_DENSITY_THRESHOLD;
  let actionRequired = 'No action needed. Continue monitoring.';
  if (predictedPercentage >= MAX_DENSITY_PERCENT) {
    actionRequired = 'IMMEDIATE: Activate overflow protocol and halt admissions.';
  } else if (surgeAlert) {
    actionRequired = 'Prepare overflow zones. Brief crowd flow staff on diversion routes.';
  } else if (predictedPercentage >= MODERATE_DENSITY_THRESHOLD) {
    actionRequired = 'Open additional gates and auxiliary concession stands.';
  }

  return { currentPercentage, predictedPercentage, minutesUntilCritical, surgeAlert, actionRequired };
}

/**
 * Generates an AI evacuation plan for a stadium based on the triggering zone
 * and current density levels across all zones.
 *
 * @param triggerZoneId  - ID of the zone where the incident occurred
 * @param zoneResults    - Current density analysis of all zones
 * @returns An {@link EvacuationPlan} with exit priorities and broadcast message
 */
export function generateEvacuationPlan(
  triggerZoneId: string,
  zoneResults: readonly ZoneDensityResult[]
): EvacuationPlan {
  // Sort zones by density ascending — evacuate to least crowded zones first
  const sorted = [...zoneResults].sort((a, b) => a.percentage - b.percentage);
  const lowDensityZones = sorted.filter((z) => z.zoneId !== triggerZoneId && z.tier !== 'Critical');
  const recommendedExits = lowDensityZones.map((z) => `${z.zoneName} (${z.percentage}% full)`).slice(0, 3);
  const priorityOrder = sorted
    .filter((z) => z.zoneId !== triggerZoneId)
    .map((z) => z.zoneName)
    .slice(0, 4);

  const triggerZone = zoneResults.find((z) => z.zoneId === triggerZoneId);
  const estimatedEvacuationMinutes = triggerZone
    ? Math.ceil((triggerZone.occupancy / 1000) * 2.5)
    : 15;

  const broadcastMessage =
    `ATTENTION: Please calmly proceed to your nearest exit. ` +
    `Recommended exits: ${recommendedExits.slice(0, 2).join(' or ')}. ` +
    `Follow staff directions. Do not run. Estimated clear time: ~${estimatedEvacuationMinutes} min.`;

  return {
    triggerZone: triggerZoneId,
    estimatedEvacuationMinutes,
    recommendedExits,
    priorityOrder,
    broadcastMessage,
  };
}
