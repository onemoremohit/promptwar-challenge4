// src/utils/stadiumEngine.ts
/**
 * @file stadiumEngine.ts
 * @description GenAI simulation engine for StadiumIQ — FIFA World Cup 2026.
 * Generates context-aware AI responses for navigation, incident classification,
 * staff task prioritization, multilingual fan assistance, and sustainability scoring.
 *
 * All functions are pure and deterministic given the same inputs, enabling
 * full unit test coverage without mocking.
 *
 * @module stadiumEngine
 */

import type { SupportedLanguage } from '../data/stadiumData';
import type { DensityTier } from './crowdEngine';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum priority score for a staff task (1–10 scale) */
export const MAX_TASK_PRIORITY = 10;

/** Minimum sustainability score to earn 'Excellent' rating */
export const EXCELLENT_SUSTAINABILITY_THRESHOLD = 80;

/** Minimum sustainability score for 'Good' rating */
export const GOOD_SUSTAINABILITY_THRESHOLD = 60;

/** Incident severity levels */
export const INCIDENT_SEVERITY = {
  MINOR: 'Minor' as const,
  MODERATE: 'Moderate' as const,
  CRITICAL: 'Critical' as const,
};

// ─── Types ────────────────────────────────────────────────────────────────────

/** Severity classification for a stadium incident */
export type IncidentSeverity = 'Minor' | 'Moderate' | 'Critical';

/** Sustainability rating classification */
export type SustainabilityRating = 'Excellent' | 'Good' | 'Needs Improvement';

/** AI-generated navigation response */
export interface NavigationResponse {
  readonly query: string;
  readonly route: string;
  readonly estimatedMinutes: number;
  readonly accessibleAlternative: string;
  readonly crowdAvoidanceTip: string;
  readonly language: SupportedLanguage;
}

/** Staff task with AI-computed priority */
export interface StaffTask {
  readonly id: string;
  readonly title: string;
  readonly zone: string;
  readonly category: 'crowd' | 'accessibility' | 'sustainability' | 'security' | 'logistics';
  readonly urgency: 1 | 2 | 3 | 4 | 5;
  readonly impact: 1 | 2 | 3 | 4 | 5;
  readonly priorityScore: number;
  readonly aiRecommendation: string;
}

/** Classified incident report */
export interface IncidentReport {
  readonly id: string;
  readonly description: string;
  readonly zone: string;
  readonly severity: IncidentSeverity;
  readonly recommendedAction: string;
  readonly escalateToSecurity: boolean;
  readonly estimatedResponseMinutes: number;
}

/** Sustainability metrics input */
export interface SustainabilityMetrics {
  readonly waterUsageLitres: number;
  readonly wasteKg: number;
  readonly recycledKg: number;
  readonly renewableEnergyPct: number;
  readonly singleUsePlasticItems: number;
}

/** Computed sustainability score result */
export interface SustainabilityResult {
  readonly score: number;
  readonly rating: SustainabilityRating;
  readonly recyclingRate: number;
  readonly carbonOffset: number;
  readonly recommendations: readonly string[];
}

/** Multilingual FAQ response from the AI assistant */
export interface MultilingualResponse {
  readonly query: string;
  readonly response: string;
  readonly language: SupportedLanguage;
  readonly confidence: number;
}

// ─── AI Navigation Engine ──────────────────────────────────────────────────────

/** Navigation intent keywords mapped to route descriptions */
const NAVIGATION_INTENTS: Record<string, { route: string; minutes: number; accessible: string }> = {
  restroom:    { route: 'Turn left at the main concourse, restrooms are 30m ahead on the right.',   minutes: 2, accessible: 'Accessible restrooms at Gate A elevator, Row 3.' },
  food:        { route: 'Food court is on Level 2 via Elevator B or the central concourse ramp.',    minutes: 4, accessible: 'Accessible food stations on Level 1 near Gate D.' },
  seat:        { route: 'Follow the color-coded seat sections from your ticket QR code at Gate B.',  minutes: 5, accessible: 'Accessible seating areas in Sections A1 and D8.' },
  exit:        { route: 'Nearest exit is Gate C, 50m south. Emergency exits are marked in red.',     minutes: 3, accessible: 'Accessible exit ramps at Gates A and D.' },
  parking:     { route: 'Parking Lot B is a 5-minute walk east via the pedestrian bridge.',          minutes: 5, accessible: 'ADA Parking in Lot A, adjacent to the accessible entrance.' },
  shuttle:     { route: 'Shuttle pick-up is at the South plaza, departing every 15 minutes.',        minutes: 6, accessible: 'Accessible shuttles with ramp service every 20 min.' },
  firstaid:    { route: 'First Aid is located on Level 1, Section B, near Gate 7.',                 minutes: 3, accessible: 'Fully accessible first aid station.' },
  entrance:    { route: 'Main entrance via Gate A. VIP entrance is at Gate F.',                      minutes: 2, accessible: 'Accessible entrance with ramp at Gate A-North.' },
};

/** Crowd avoidance tips keyed by density tier */
const CROWD_TIPS: Record<DensityTier, string> = {
  Low:      'Conditions are clear — proceed via any route.',
  Moderate: 'Mild congestion near Gate B — use Gate D as an alternative.',
  High:     'High traffic near main concourse. Use Level 3 walkway to avoid delays.',
  Critical: 'Avoid Gate C and main concourse entirely. Follow staff to Gate A or G.',
};

/**
 * Generates a context-aware AI navigation response from a natural language query.
 * Detects intent from keywords and adapts advice based on current crowd density.
 *
 * @param query        - The fan's natural language question
 * @param crowdTier    - Current stadium crowd density tier
 * @param language     - Preferred response language (currently English only; extend for full multilingual)
 * @returns A {@link NavigationResponse} with route, time estimate, and crowd tip
 *
 * @example
 * ```ts
 * generateNavigation('Where is the nearest bathroom?', 'High', 'en');
 * // → { route: 'Turn left at the main concourse...', estimatedMinutes: 2, ... }
 * ```
 */
export function generateNavigation(
  query: string,
  crowdTier: DensityTier,
  language: SupportedLanguage = 'en'
): NavigationResponse {
  const lower = query.toLowerCase();
  const intent = Object.keys(NAVIGATION_INTENTS).find((key) => lower.includes(key));
  const nav = intent ? NAVIGATION_INTENTS[intent] : {
    route: 'Please visit any information kiosk on Level 1 or ask a green-vested volunteer for help.',
    minutes: 3,
    accessible: 'Accessible information desks are at Gate A and Gate D.',
  };

  return {
    query,
    route: nav.route,
    estimatedMinutes: nav.minutes,
    accessibleAlternative: nav.accessible,
    crowdAvoidanceTip: CROWD_TIPS[crowdTier],
    language,
  };
}

// ─── Incident Classification Engine ───────────────────────────────────────────

/** Keywords that elevate an incident to Critical severity */
const CRITICAL_KEYWORDS = ['fire', 'bomb', 'weapon', 'attack', 'emergency', 'collapse', 'stampede', 'explosion'];

/** Keywords that classify an incident as Moderate */
const MODERATE_KEYWORDS = ['fight', 'injury', 'medical', 'unconscious', 'crowd crush', 'barrier', 'breach', 'lost child'];

/**
 * Classifies an incident description into a severity tier using keyword analysis
 * and generates recommended response actions.
 *
 * @param description - Free-text description of the incident
 * @param zone        - Stadium zone where the incident occurred
 * @param incidentId  - Unique identifier for this report
 * @returns An {@link IncidentReport} with severity, action, and response estimate
 *
 * @example
 * ```ts
 * classifyIncident('Medical emergency in North Stand', 'A', 'INC-001');
 * // → { severity: 'Moderate', escalateToSecurity: true, ... }
 * ```
 */
export function classifyIncident(description: string, zone: string, incidentId: string): IncidentReport {
  const lower = description.toLowerCase();

  let severity: IncidentSeverity = INCIDENT_SEVERITY.MINOR;
  let recommendedAction = 'Log the incident. Dispatch a volunteer to assess. Monitor for escalation.';
  let escalateToSecurity = false;
  let estimatedResponseMinutes = 10;

  if (CRITICAL_KEYWORDS.some((kw) => lower.includes(kw))) {
    severity = INCIDENT_SEVERITY.CRITICAL;
    recommendedAction = 'IMMEDIATE: Alert security command. Evacuate affected zone. Contact emergency services (911). Activate incident management protocol.';
    escalateToSecurity = true;
    estimatedResponseMinutes = 2;
  } else if (MODERATE_KEYWORDS.some((kw) => lower.includes(kw))) {
    severity = INCIDENT_SEVERITY.MODERATE;
    recommendedAction = 'Dispatch first aid team and two security officers. Notify zone supervisor. Document all actions taken.';
    escalateToSecurity = true;
    estimatedResponseMinutes = 5;
  }

  return {
    id: incidentId,
    description,
    zone,
    severity,
    recommendedAction,
    escalateToSecurity,
    estimatedResponseMinutes,
  };
}

// ─── Task Prioritization Engine ───────────────────────────────────────────────

/**
 * Computes an AI priority score for a staff task based on urgency and impact.
 * Uses a weighted formula: (urgency × 0.6) + (impact × 0.4), scaled to 1–10.
 *
 * @param urgency - Task urgency on a 1–5 scale
 * @param impact  - Task operational impact on a 1–5 scale
 * @returns A priority score rounded to one decimal place (1.0–10.0)
 *
 * @example
 * ```ts
 * computeTaskPriority(5, 5); // → 10.0
 * computeTaskPriority(3, 2); // → 6.2
 * computeTaskPriority(1, 1); // → 2.0
 * ```
 */
export function computeTaskPriority(urgency: number, impact: number): number {
  const raw = (urgency * 0.6 + impact * 0.4) * 2;
  return parseFloat(Math.min(raw, MAX_TASK_PRIORITY).toFixed(1));
}

/**
 * Sorts an array of staff tasks by their AI priority score (highest first).
 *
 * @param tasks - Array of staff tasks with precomputed priority scores
 * @returns A new sorted array (does not mutate the input)
 */
export function prioritizeTasks(tasks: readonly StaffTask[]): StaffTask[] {
  return [...tasks].sort((a, b) => b.priorityScore - a.priorityScore);
}

// ─── Sustainability Scoring Engine ─────────────────────────────────────────────

/**
 * Computes a sustainability score from operational metrics.
 * Factors: recycling rate, renewable energy %, single-use plastic penalty.
 *
 * @param metrics - Current sustainability operational metrics
 * @returns A {@link SustainabilityResult} with score, rating, and recommendations
 *
 * @example
 * ```ts
 * computeSustainabilityScore({ recycledKg: 800, wasteKg: 1000, renewableEnergyPct: 75, ... });
 * // → { score: 77.5, rating: 'Good', ... }
 * ```
 */
export function computeSustainabilityScore(metrics: SustainabilityMetrics): SustainabilityResult {
  const recyclingRate = metrics.wasteKg > 0
    ? parseFloat(((metrics.recycledKg / metrics.wasteKg) * 100).toFixed(1))
    : 0;

  const recyclingScore    = recyclingRate * 0.4;          // 0–40 pts
  const renewableScore    = metrics.renewableEnergyPct * 0.35;  // 0–35 pts
  const plasticPenalty    = Math.min(metrics.singleUsePlasticItems * 0.1, 25); // up to -25 pts
  const score             = parseFloat(Math.max(0, Math.min(100, recyclingScore + renewableScore - plasticPenalty)).toFixed(1));
  const carbonOffset      = parseFloat((metrics.recycledKg * 2.5).toFixed(1)); // kg CO2e saved

  let rating: SustainabilityRating;
  if (score >= EXCELLENT_SUSTAINABILITY_THRESHOLD) rating = 'Excellent';
  else if (score >= GOOD_SUSTAINABILITY_THRESHOLD) rating = 'Good';
  else rating = 'Needs Improvement';

  const recommendations: string[] = [];
  if (recyclingRate < 50) recommendations.push('Increase recycling bin placement — target 50%+ diversion rate.');
  if (metrics.renewableEnergyPct < 50) recommendations.push('Shift to renewable energy sources — engage solar/wind contracts.');
  if (metrics.singleUsePlasticItems > 100) recommendations.push('Eliminate single-use plastics — deploy reusable cup programme.');
  if (metrics.waterUsageLitres > 50_000) recommendations.push('Install low-flow fixtures — target <50,000L per match day.');

  return { score, rating, recyclingRate, carbonOffset, recommendations };
}

// ─── Multilingual FAQ Engine ───────────────────────────────────────────────────

/** Multilingual FAQ responses for common fan questions */
const FAQ_RESPONSES: Record<string, Record<SupportedLanguage, string>> = {
  ticket: {
    en: 'Show your digital ticket QR code at any gate scanner. Gates open 3 hours before kick-off.',
    es: 'Muestre el código QR de su boleto digital en cualquier escáner de puerta. Las puertas abren 3 horas antes.',
    fr: 'Présentez le QR code de votre billet numérique à n\'importe quel scanner. Les portes ouvrent 3h avant.',
    ar: 'أظهر رمز QR لتذكرتك الرقمية عند أي ماسح ضوئي للبوابة. تفتح البوابات قبل 3 ساعات من بدء المباراة.',
    pt: 'Mostre o QR code do seu bilhete digital em qualquer leitor de portão. Os portões abrem 3 horas antes.',
    de: 'Zeigen Sie Ihren digitalen Ticket-QR-Code an einem Torscanner. Tore öffnen 3 Stunden vor Anpfiff.',
  },
  food: {
    en: 'Food and beverages are available on all levels. Halal, vegan, and allergen-free options are at every concourse.',
    es: 'Comida y bebidas disponibles en todos los niveles. Opciones halal, veganas y sin alérgenos en todos los vestíbulos.',
    fr: 'Restauration disponible à tous les niveaux. Options halal, véganes et sans allergènes dans chaque couloir.',
    ar: 'الطعام والمشروبات متاحة في جميع الطوابق. خيارات حلال ونباتية وخالية من مسببات الحساسية في كل ممر.',
    pt: 'Alimentação disponível em todos os níveis. Opções halal, veganas e sem alérgenos em cada corredor.',
    de: 'Speisen und Getränke auf allen Ebenen verfügbar. Halal-, vegane und allergenfreie Optionen in jedem Korridor.',
  },
  parking: {
    en: 'Use designated Park & Ride lots. ADA parking is in Lot A near Gate North. Arrive 2+ hours early.',
    es: 'Use los estacionamientos Park & Ride designados. ADA está en el Lote A cerca de la Puerta Norte.',
    fr: 'Utilisez les parkings Park & Ride désignés. Parking PMR au Lot A près de la Porte Nord.',
    ar: 'استخدم مواقف Park & Ride المخصصة. مواقف ذوي الاحتياجات الخاصة في قطعة A بالقرب من البوابة الشمالية.',
    pt: 'Use os estacionamentos Park & Ride designados. Estacionamento ADA no Lote A perto do Portão Norte.',
    de: 'Nutzen Sie die ausgewiesenen Park & Ride Parkplätze. Behindertengerechte Parkplätze in Lot A am Nordtor.',
  },
  wifi: {
    en: 'Free Wi-Fi: Network "FIFA2026" — no password required. Streaming is limited to reduce congestion.',
    es: 'Wi-Fi gratuito: Red "FIFA2026" — sin contraseña. El streaming está limitado para reducir la congestión.',
    fr: 'Wi-Fi gratuit : Réseau "FIFA2026" — sans mot de passe. Le streaming est limité.',
    ar: 'واي فاي مجاني: الشبكة "FIFA2026" — بدون كلمة مرور. البث المباشر محدود لتقليل الازدحام.',
    pt: 'Wi-Fi gratuito: Rede "FIFA2026" — sem senha. Streaming é limitado para reduzir o congestionamento.',
    de: 'Kostenloses WLAN: Netzwerk "FIFA2026" — kein Passwort. Streaming ist begrenzt.',
  },
};

/**
 * Generates a multilingual AI response to a fan FAQ query.
 * Detects the topic from keywords and returns a localised response.
 *
 * @param query    - The fan's question in any language
 * @param language - Target response language
 * @returns A {@link MultilingualResponse} with the localised answer
 */
export function generateMultilingualResponse(query: string, language: SupportedLanguage): MultilingualResponse {
  const lower = query.toLowerCase();
  const topic = Object.keys(FAQ_RESPONSES).find((key) => lower.includes(key));

  const response = topic
    ? FAQ_RESPONSES[topic][language]
    : ({
        en: 'Thank you for your question. Please visit an information kiosk or ask a FIFA volunteer for assistance.',
        es: 'Gracias por su pregunta. Visite un quiosco de información o pregunte a un voluntario de la FIFA.',
        fr: 'Merci pour votre question. Veuillez visiter une borne d\'information ou demander à un bénévole FIFA.',
        ar: 'شكراً على سؤالك. يرجى زيارة كشك المعلومات أو طلب المساعدة من متطوع FIFA.',
        pt: 'Obrigado pela sua pergunta. Por favor visite um quiosque de informações ou peça ajuda a um voluntário FIFA.',
        de: 'Danke für Ihre Frage. Bitte besuchen Sie einen Informationskiosk oder fragen Sie einen FIFA-Freiwilligen.',
      } as Record<SupportedLanguage, string>)[language];

  return {
    query,
    response,
    language,
    confidence: topic ? 0.95 : 0.72,
  };
}
