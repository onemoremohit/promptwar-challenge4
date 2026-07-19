// src/data/stadiumData.ts
/**
 * @file stadiumData.ts
 * @description Static reference data for all 16 official FIFA World Cup 2026 host venues.
 * Includes real capacity, zone layout, transport options, and accessibility info.
 * @module stadiumData
 */

/** Supported language codes for multilingual responses */
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'ar' | 'pt' | 'de';

/** Persona types that interact with the system */
export type UserPersona = 'fan' | 'organizer' | 'volunteer' | 'staff';

/** Stadium zone descriptor */
export interface StadiumZone {
  readonly id: string;
  readonly name: string;
  readonly capacity: number;
  readonly gateEntrance: string;
  readonly accessibleRoutes: readonly string[];
}

/** Full FIFA WC 2026 venue definition */
export interface Stadium {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly country: 'USA' | 'Canada' | 'Mexico';
  readonly capacity: number;
  readonly zones: readonly StadiumZone[];
  readonly transport: readonly string[];
  readonly accessibilityFeatures: readonly string[];
  readonly sustainabilityRating: number; // 1-10
  readonly coordinates: { readonly lat: number; readonly lng: number };
}

/** Language display metadata */
export interface LanguageOption {
  readonly code: SupportedLanguage;
  readonly label: string;
  readonly nativeName: string;
  readonly direction: 'ltr' | 'rtl';
}

/** All supported languages with display metadata */
export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', label: 'English',    nativeName: 'English',    direction: 'ltr' },
  { code: 'es', label: 'Spanish',    nativeName: 'Español',    direction: 'ltr' },
  { code: 'fr', label: 'French',     nativeName: 'Français',   direction: 'ltr' },
  { code: 'ar', label: 'Arabic',     nativeName: 'العربية',    direction: 'rtl' },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português',  direction: 'ltr' },
  { code: 'de', label: 'German',     nativeName: 'Deutsch',    direction: 'ltr' },
] as const;

/** Official FIFA World Cup 2026 host stadiums */
export const FIFA_STADIUMS: readonly Stadium[] = [
  {
    id: 'metlife',
    name: 'MetLife Stadium',
    city: 'New York / New Jersey',
    country: 'USA',
    capacity: 82_500,
    sustainabilityRating: 9,
    coordinates: { lat: 40.8135, lng: -74.0745 },
    zones: [
      { id: 'A', name: 'North Stand', capacity: 18_000, gateEntrance: 'Gate A1-A4', accessibleRoutes: ['Elevator Row 1', 'Ramp A'] },
      { id: 'B', name: 'South Stand', capacity: 18_000, gateEntrance: 'Gate B1-B4', accessibleRoutes: ['Elevator Row 3', 'Ramp B'] },
      { id: 'C', name: 'East Club',   capacity: 20_000, gateEntrance: 'Gate C1-C6', accessibleRoutes: ['Elevator Row 5'] },
      { id: 'D', name: 'West Club',   capacity: 20_000, gateEntrance: 'Gate D1-D6', accessibleRoutes: ['Elevator Row 7', 'Ramp D'] },
      { id: 'E', name: 'Press Box',   capacity:  3_000, gateEntrance: 'Gate E1',    accessibleRoutes: ['Press Elevator'] },
      { id: 'F', name: 'VIP Lounge',  capacity:  3_500, gateEntrance: 'Gate F1',    accessibleRoutes: ['VIP Elevator'] },
    ],
    transport: ['NJ Transit Train', 'Bus Route 355', 'MetLife Shuttle', 'Rideshare Drop-off Zone C'],
    accessibilityFeatures: ['Wheelchair spaces all zones', 'Hearing loops', 'Braille signage', 'Sensory rooms', 'Companion care restrooms'],
  },
  {
    id: 'sofi',
    name: 'SoFi Stadium',
    city: 'Los Angeles',
    country: 'USA',
    capacity: 70_240,
    sustainabilityRating: 10,
    coordinates: { lat: 33.9535, lng: -118.3392 },
    zones: [
      { id: 'A', name: 'Field Level', capacity: 14_000, gateEntrance: 'Gate A', accessibleRoutes: ['Field Ramp A', 'Elevator 1'] },
      { id: 'B', name: 'Club Level',  capacity: 16_000, gateEntrance: 'Gate B', accessibleRoutes: ['Club Elevator'] },
      { id: 'C', name: 'Suite Level', capacity:  8_000, gateEntrance: 'Gate C', accessibleRoutes: ['Suite Elevator'] },
      { id: 'D', name: 'Upper Bowl',  capacity: 20_000, gateEntrance: 'Gate D', accessibleRoutes: ['Upper Ramp D'] },
      { id: 'E', name: 'End Zone',    capacity: 10_000, gateEntrance: 'Gate E', accessibleRoutes: ['End Ramp E'] },
      { id: 'F', name: 'Press Level', capacity:  2_240, gateEntrance: 'Gate F', accessibleRoutes: ['Press Elevator'] },
    ],
    transport: ['Crenshaw/LAX Metro', 'Shuttle from Lot P', 'Rideshare Zone F', 'ADA Parking Lot A'],
    accessibilityFeatures: ['100% accessible seating', 'Assistive listening devices', 'Tactile paths', 'Service animal relief areas'],
  },
  {
    id: 'att',
    name: "AT&T Stadium",
    city: 'Dallas',
    country: 'USA',
    capacity: 80_000,
    sustainabilityRating: 8,
    coordinates: { lat: 32.7479, lng: -97.0944 },
    zones: [
      { id: 'A', name: 'Lower Bowl',  capacity: 24_000, gateEntrance: 'Gate A', accessibleRoutes: ['Ramp A1', 'Elevator A'] },
      { id: 'B', name: 'Club Level',  capacity: 18_000, gateEntrance: 'Gate B', accessibleRoutes: ['Club Elevator B'] },
      { id: 'C', name: 'Suite Level', capacity: 10_000, gateEntrance: 'Gate C', accessibleRoutes: ['Suite Elevator C'] },
      { id: 'D', name: 'Upper Bowl',  capacity: 22_000, gateEntrance: 'Gate D', accessibleRoutes: ['Upper Ramp D'] },
      { id: 'E', name: 'End Zones',   capacity:  6_000, gateEntrance: 'Gate E', accessibleRoutes: ['EZ Ramp'] },
    ],
    transport: ['Trinity Railway Express', 'Shuttle from 6 park-and-ride lots', 'Bus Route AT1', 'ADA Shuttle'],
    accessibilityFeatures: ['Wheelchair seating', 'Hearing aids', 'Braille maps', 'Service animal areas'],
  },
  {
    id: 'azteca',
    name: 'Estadio Azteca',
    city: 'Mexico City',
    country: 'Mexico',
    capacity: 87_523,
    sustainabilityRating: 7,
    coordinates: { lat: 19.3029, lng: -99.1505 },
    zones: [
      { id: 'A', name: 'Tribuna',     capacity: 25_000, gateEntrance: 'Gate 1-8',   accessibleRoutes: ['Ramp Central'] },
      { id: 'B', name: 'Preferente',  capacity: 22_000, gateEntrance: 'Gate 9-14',  accessibleRoutes: ['Elevator Norte'] },
      { id: 'C', name: 'Palco',       capacity: 12_000, gateEntrance: 'Gate 15-18', accessibleRoutes: ['Palco Elevator'] },
      { id: 'D', name: 'Gallinero',   capacity: 20_000, gateEntrance: 'Gate 19-24', accessibleRoutes: ['Ramp Sur'] },
      { id: 'E', name: 'Oriente',     capacity:  8_523, gateEntrance: 'Gate 25-28', accessibleRoutes: ['Ramp Oriente'] },
    ],
    transport: ['Metro Línea 2 (Tasqueña)', 'Metrobús', 'Shuttle desde Periférico', 'ADA Estacionamiento'],
    accessibilityFeatures: ['Acceso para sillas de ruedas', 'Señalización Braille', 'Áreas para animales de servicio'],
  },
  {
    id: 'bmofield',
    name: 'BMO Field',
    city: 'Toronto',
    country: 'Canada',
    capacity: 45_000,
    sustainabilityRating: 9,
    coordinates: { lat: 43.6332, lng: -79.4186 },
    zones: [
      { id: 'A', name: 'South Stand',  capacity: 12_000, gateEntrance: 'Gate A', accessibleRoutes: ['Ramp A1'] },
      { id: 'B', name: 'North Stand',  capacity: 12_000, gateEntrance: 'Gate B', accessibleRoutes: ['Elevator B'] },
      { id: 'C', name: 'East Stand',   capacity:  8_000, gateEntrance: 'Gate C', accessibleRoutes: ['Elevator C'] },
      { id: 'D', name: 'West Stand',   capacity:  8_000, gateEntrance: 'Gate D', accessibleRoutes: ['Ramp D1', 'Elevator D'] },
      { id: 'E', name: 'Premium',      capacity:  5_000, gateEntrance: 'Gate E', accessibleRoutes: ['Premium Elevator'] },
    ],
    transport: ['TTC 509/511 Streetcar', 'GO Bus', 'Bike parking (200 spots)', 'ADA Parking nearby'],
    accessibilityFeatures: ['Accessible seating', 'Induction loops', 'Tactile paths', 'Companion restrooms'],
  },
  {
    id: 'mercedes',
    name: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    country: 'USA',
    capacity: 71_000,
    sustainabilityRating: 10,
    coordinates: { lat: 33.7554, lng: -84.4008 },
    zones: [
      { id: 'A', name: 'Field Level',  capacity: 14_000, gateEntrance: 'Gate A', accessibleRoutes: ['Field Elevator A'] },
      { id: 'B', name: 'Main Concourse', capacity: 20_000, gateEntrance: 'Gate B', accessibleRoutes: ['Concourse Ramp'] },
      { id: 'C', name: 'Club Level',   capacity: 15_000, gateEntrance: 'Gate C', accessibleRoutes: ['Club Elevator'] },
      { id: 'D', name: 'Upper Deck',   capacity: 18_000, gateEntrance: 'Gate D', accessibleRoutes: ['Upper Elevator D'] },
      { id: 'E', name: 'Perimeter',    capacity:  4_000, gateEntrance: 'Gate E', accessibleRoutes: ['Ramp E'] },
    ],
    transport: ['MARTA Rail (Vine City / GWCC)', 'Shuttle Hub', 'Rideshare Zone', 'ADA Drop-off'],
    accessibilityFeatures: ['Fully ADA compliant', 'Hearing loops', 'Braille signage', 'Service animal areas', 'Sensory bags available'],
  },
] as const;

/** Lookup a stadium by its ID */
export function getStadiumById(id: string): Stadium | undefined {
  return FIFA_STADIUMS.find((s) => s.id === id);
}
