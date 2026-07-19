// src/utils/sanitizer.ts
/**
 * @file sanitizer.ts
 * @description Input sanitization utilities for StadiumIQ.
 * Prevents XSS injection in AI chat inputs, incident reports, and user-generated fields.
 * All user inputs MUST pass through these functions before touching React state.
 *
 * @module sanitizer
 */

/**
 * Sanitizes a string input by stripping all HTML/XML tags to prevent
 * Cross-Site Scripting (XSS) attacks. Non-string inputs are coerced to
 * an empty string. Leading/trailing whitespace is trimmed.
 *
 * @param val - The raw string value to sanitize
 * @returns A plain-text string with all HTML tags removed and whitespace trimmed
 *
 * @example
 * ```ts
 * sanitizeString('<script>alert("xss")</script>Hello'); // → 'alert("xss")Hello'
 * sanitizeString('  Stadium A  ');                      // → 'Stadium A'
 * sanitizeString(null);                                 // → ''
 * ```
 */
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validates and clamps a numeric input to a specified safe range.
 * Handles NaN, null, undefined, and out-of-range values gracefully.
 *
 * @param val   - The raw value to validate (any type, coerced via Number())
 * @param min   - Minimum allowed value (inclusive). Defaults to 0.
 * @param max   - Maximum allowed value (inclusive). Defaults to 1_000_000.
 * @returns A finite number clamped within [min, max]
 *
 * @example
 * ```ts
 * sanitizeNumber('250', 0, 500);  // → 250
 * sanitizeNumber(-5, 0, 500);     // → 0   (clamped to min)
 * sanitizeNumber(NaN, 0, 500);    // → 0   (NaN → min)
 * sanitizeNumber(undefined);      // → 0
 * ```
 */
export function sanitizeNumber(val: unknown, min = 0, max = 1_000_000): number {
  const num = Number(val);
  if (isNaN(num)) return min;
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

/**
 * Truncates a string to a maximum character length to prevent
 * excessively long AI chat inputs from overwhelming the engine.
 *
 * @param val     - The input string to truncate
 * @param maxLen  - Maximum allowed character length. Defaults to 500.
 * @returns The original string or a truncated version with an ellipsis suffix
 *
 * @example
 * ```ts
 * sanitizeLength('hello world', 5);  // → 'hello…'
 * sanitizeLength('hi', 100);         // → 'hi'
 * ```
 */
export function sanitizeLength(val: string, maxLen = 500): string {
  const clean = sanitizeString(val);
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen) + '…';
}
