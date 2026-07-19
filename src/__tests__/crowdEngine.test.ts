// src/__tests__/crowdEngine.test.ts
/**
 * @file crowdEngine.test.ts
 * @description Test suite for the crowd intelligence engine.
 * Covers density classification, zone analysis, stadium aggregation,
 * surge prediction, evacuation plan generation, and edge cases.
 */
import { describe, test, expect } from 'vitest';
import {
  getCrowdTier,
  getZoneRecommendation,
  analyzeZoneDensity,
  computeStadiumOccupancy,
  predictCrowdSurge,
  generateEvacuationPlan,
  LOW_DENSITY_THRESHOLD,
  MODERATE_DENSITY_THRESHOLD,
  HIGH_DENSITY_THRESHOLD,
} from '../utils/crowdEngine';
import type { StadiumZone } from '../data/stadiumData';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const MOCK_ZONE: StadiumZone = {
  id: 'A',
  name: 'North Stand',
  capacity: 18_000,
  gateEntrance: 'Gate A1-A4',
  accessibleRoutes: ['Elevator Row 1'],
};

const MOCK_ZONE_B: StadiumZone = {
  id: 'B',
  name: 'South Stand',
  capacity: 12_000,
  gateEntrance: 'Gate B1-B4',
  accessibleRoutes: ['Ramp B'],
};

// ─── Suite 1: getCrowdTier ────────────────────────────────────────────────────
describe('getCrowdTier — density classification', () => {
  test('returns Low for percentage below LOW_DENSITY_THRESHOLD', () => {
    expect(getCrowdTier(0)).toBe('Low');
    expect(getCrowdTier(30)).toBe('Low');
    expect(getCrowdTier(LOW_DENSITY_THRESHOLD - 1)).toBe('Low');
  });

  test('returns Moderate for percentage in [60, 80)', () => {
    expect(getCrowdTier(60)).toBe('Moderate');
    expect(getCrowdTier(72)).toBe('Moderate');
    expect(getCrowdTier(MODERATE_DENSITY_THRESHOLD - 1)).toBe('Moderate');
  });

  test('returns High for percentage in [80, 95)', () => {
    expect(getCrowdTier(80)).toBe('High');
    expect(getCrowdTier(88)).toBe('High');
    expect(getCrowdTier(HIGH_DENSITY_THRESHOLD - 1)).toBe('High');
  });

  test('returns Critical for percentage >= 95', () => {
    expect(getCrowdTier(95)).toBe('Critical');
    expect(getCrowdTier(100)).toBe('Critical');
    expect(getCrowdTier(HIGH_DENSITY_THRESHOLD)).toBe('Critical');
  });

  test('boundary: exactly 60% is Moderate (not Low)', () => {
    expect(getCrowdTier(60)).toBe('Moderate');
  });

  test('boundary: exactly 80% is High (not Moderate)', () => {
    expect(getCrowdTier(80)).toBe('High');
  });

  test('boundary: exactly 95% is Critical (not High)', () => {
    expect(getCrowdTier(95)).toBe('Critical');
  });
});

// ─── Suite 2: getZoneRecommendation ───────────────────────────────────────────
describe('getZoneRecommendation — recommendation strings', () => {
  test('Low tier recommendation mentions zone name', () => {
    const result = getZoneRecommendation('Low', 'Zone A');
    expect(result).toContain('Zone A');
    expect(result).toContain('60%');
  });

  test('Critical tier recommendation contains CRITICAL warning', () => {
    const result = getZoneRecommendation('Critical', 'North Stand');
    expect(result).toContain('CRITICAL');
    expect(result).toContain('North Stand');
  });

  test('High tier recommendation mentions slow gate admissions', () => {
    const result = getZoneRecommendation('High', 'East Club');
    expect(result).toContain('slow gate admissions');
  });

  test('Moderate tier recommendation mentions auxiliary concessions', () => {
    const result = getZoneRecommendation('Moderate', 'West Club');
    expect(result).toContain('auxiliary concessions');
  });
});

// ─── Suite 3: analyzeZoneDensity ─────────────────────────────────────────────
describe('analyzeZoneDensity — zone analysis', () => {
  test('returns correct percentage for 50% occupancy', () => {
    const result = analyzeZoneDensity(MOCK_ZONE, 9_000);
    expect(result.percentage).toBe(50);
    expect(result.tier).toBe('Low');
  });

  test('returns correct percentage for 80% occupancy', () => {
    const result = analyzeZoneDensity(MOCK_ZONE, 14_400);
    expect(result.percentage).toBe(80);
    expect(result.tier).toBe('High');
  });

  test('returns Critical tier at 100% capacity', () => {
    const result = analyzeZoneDensity(MOCK_ZONE, 18_000);
    expect(result.percentage).toBe(100);
    expect(result.tier).toBe('Critical');
  });

  test('clamps occupancy above capacity to capacity value', () => {
    const result = analyzeZoneDensity(MOCK_ZONE, 99_999);
    expect(result.occupancy).toBe(MOCK_ZONE.capacity);
    expect(result.percentage).toBe(100);
  });

  test('clamps negative occupancy to 0', () => {
    const result = analyzeZoneDensity(MOCK_ZONE, -100);
    expect(result.occupancy).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.tier).toBe('Low');
  });

  test('result contains all required fields', () => {
    const result = analyzeZoneDensity(MOCK_ZONE, 9_000);
    expect(result).toHaveProperty('zoneId');
    expect(result).toHaveProperty('zoneName');
    expect(result).toHaveProperty('occupancy');
    expect(result).toHaveProperty('capacity');
    expect(result).toHaveProperty('percentage');
    expect(result).toHaveProperty('tier');
    expect(result).toHaveProperty('recommendation');
  });

  test('zoneId and zoneName match the input zone', () => {
    const result = analyzeZoneDensity(MOCK_ZONE, 5_000);
    expect(result.zoneId).toBe('A');
    expect(result.zoneName).toBe('North Stand');
  });
});

// ─── Suite 4: computeStadiumOccupancy ─────────────────────────────────────────
describe('computeStadiumOccupancy — aggregated stats', () => {
  test('handles empty zone results array', () => {
    const result = computeStadiumOccupancy([]);
    expect(result.totalOccupancy).toBe(0);
    expect(result.totalCapacity).toBe(0);
    expect(result.overallTier).toBe('Low');
  });

  test('correctly sums occupancy across multiple zones', () => {
    const zones = [
      analyzeZoneDensity(MOCK_ZONE, 9_000),   // 50%
      analyzeZoneDensity(MOCK_ZONE_B, 6_000), // 50%
    ];
    const result = computeStadiumOccupancy(zones);
    expect(result.totalOccupancy).toBe(15_000);
    expect(result.totalCapacity).toBe(30_000);
    expect(result.overallPercentage).toBe(50);
  });

  test('correctly identifies critical zones', () => {
    const zones = [
      analyzeZoneDensity(MOCK_ZONE, 18_000),  // Critical: 100%
      analyzeZoneDensity(MOCK_ZONE_B, 3_000), // Low: 25%
    ];
    const result = computeStadiumOccupancy(zones);
    expect(result.criticalZones).toContain('North Stand');
    expect(result.criticalZones).not.toContain('South Stand');
  });

  test('averageDensity is the mean of zone percentages', () => {
    const zones = [
      analyzeZoneDensity(MOCK_ZONE, 9_000),    // 50%
      analyzeZoneDensity(MOCK_ZONE_B, 12_000), // 100%
    ];
    const result = computeStadiumOccupancy(zones);
    expect(result.averageDensity).toBeCloseTo(75, 0);
  });
});

// ─── Suite 5: predictCrowdSurge ───────────────────────────────────────────────
describe('predictCrowdSurge — predictive AI', () => {
  test('returns no surge alert at low density with low inflow', () => {
    const result = predictCrowdSurge(30, 0.2);
    expect(result.surgeAlert).toBe(false);
  });

  test('returns surge alert when predicted density reaches high tier', () => {
    // 78 + (1.2 * 20) = 102 → capped at 100 → above HIGH_DENSITY_THRESHOLD (95)
    const result = predictCrowdSurge(78, 1.2);
    expect(result.predictedPercentage).toBeGreaterThanOrEqual(95);
    expect(result.surgeAlert).toBe(true);
  });

  test('predicted percentage never exceeds 100', () => {
    const result = predictCrowdSurge(99, 5.0);
    expect(result.predictedPercentage).toBeLessThanOrEqual(100);
  });

  test('minutesUntilCritical is calculated when density is below threshold', () => {
    const result = predictCrowdSurge(50, 1.0);
    expect(result.minutesUntilCritical).not.toBeNull();
    expect(result.minutesUntilCritical).toBeGreaterThan(0);
  });

  test('minutesUntilCritical is null when already at or above critical threshold', () => {
    const result = predictCrowdSurge(96, 1.0);
    expect(result.minutesUntilCritical).toBeNull();
  });

  test('actionRequired changes with predicted density level', () => {
    const lowResult = predictCrowdSurge(10, 0.1);
    const criticalResult = predictCrowdSurge(98, 5.0);
    expect(lowResult.actionRequired).not.toBe(criticalResult.actionRequired);
    expect(criticalResult.actionRequired).toContain('IMMEDIATE');
  });

  test('result contains currentPercentage matching input', () => {
    const result = predictCrowdSurge(65, 0.5);
    expect(result.currentPercentage).toBe(65);
  });
});

// ─── Suite 6: generateEvacuationPlan ──────────────────────────────────────────
describe('generateEvacuationPlan — AI evacuation routing', () => {
  const zoneResults = [
    analyzeZoneDensity(MOCK_ZONE, 18_000),   // Zone A: Critical (trigger)
    analyzeZoneDensity(MOCK_ZONE_B, 3_000),  // Zone B: Low (25%)
  ];

  test('broadcastMessage is a non-empty string', () => {
    const plan = generateEvacuationPlan('A', zoneResults);
    expect(typeof plan.broadcastMessage).toBe('string');
    expect(plan.broadcastMessage.length).toBeGreaterThan(10);
  });

  test('estimatedEvacuationMinutes is a positive number', () => {
    const plan = generateEvacuationPlan('A', zoneResults);
    expect(plan.estimatedEvacuationMinutes).toBeGreaterThan(0);
  });

  test('trigger zone is recorded correctly', () => {
    const plan = generateEvacuationPlan('A', zoneResults);
    expect(plan.triggerZone).toBe('A');
  });

  test('recommendedExits does not include trigger zone', () => {
    const plan = generateEvacuationPlan('A', zoneResults);
    expect(plan.recommendedExits.every((exit) => !exit.startsWith('North Stand'))).toBe(true);
  });

  test('priorityOrder is an array', () => {
    const plan = generateEvacuationPlan('A', zoneResults);
    expect(Array.isArray(plan.priorityOrder)).toBe(true);
  });
});
