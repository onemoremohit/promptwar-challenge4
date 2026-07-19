// src/__tests__/sanitizer.test.ts
/**
 * @file sanitizer.test.ts
 * @description Comprehensive test suite for StadiumIQ input sanitization utilities.
 * Covers HTML/XSS stripping, numeric clamping, length enforcement, and edge cases.
 */
import { describe, test, expect } from 'vitest';
import { sanitizeString, sanitizeNumber, sanitizeLength } from '../utils/sanitizer';

// ─── Suite 1: sanitizeString ──────────────────────────────────────────────────
describe('sanitizeString — HTML and XSS stripping', () => {
  test('returns a plain-text string unchanged', () => {
    expect(sanitizeString('MetLife Stadium')).toBe('MetLife Stadium');
  });

  test('strips a simple HTML bold tag', () => {
    expect(sanitizeString('<b>Gate A</b>')).toBe('Gate A');
  });

  test('strips script injection (XSS vector)', () => {
    const result = sanitizeString('<script>alert("xss")</script>Gate B');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
    expect(result).toContain('Gate B');
  });

  test('strips img onerror XSS vector', () => {
    const result = sanitizeString('<img src="x" onerror="alert(1)" />');
    expect(result).not.toContain('<img');
    expect(result).not.toContain('onerror');
  });

  test('strips anchor tags while preserving inner text', () => {
    expect(sanitizeString('<a href="evil.com">Click here</a>')).toBe('Click here');
  });

  test('strips nested HTML tags', () => {
    expect(sanitizeString('<div><p>Zone C</p></div>')).toBe('Zone C');
  });

  test('strips style tags (tag markup removed)', () => {
    const result = sanitizeString('<style>body{color:red}</style>text');
    expect(result).not.toContain('<style>');
    expect(result).not.toContain('</style>');
    expect(result).toContain('text');
  });

  test('trims leading and trailing whitespace', () => {
    expect(sanitizeString('   SoFi Stadium   ')).toBe('SoFi Stadium');
  });

  test('returns empty string for empty input', () => {
    expect(sanitizeString('')).toBe('');
  });

  test('returns empty string for non-string input: number', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeString(42 as any)).toBe('');
  });

  test('returns empty string for non-string input: null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeString(null as any)).toBe('');
  });

  test('returns empty string for non-string input: undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeString(undefined as any)).toBe('');
  });

  test('returns empty string for non-string input: object', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeString({ key: 'val' } as any)).toBe('');
  });

  test('handles multiple sequential HTML tags', () => {
    expect(sanitizeString('<em><strong>Gate E</strong></em>')).toBe('Gate E');
  });

  test('handles self-closing tags (line break)', () => {
    expect(sanitizeString('Level 1<br/>Level 2')).toBe('Level 1Level 2');
  });

  test('preserves numbers within a string', () => {
    expect(sanitizeString('Capacity: 82500 fans')).toBe('Capacity: 82500 fans');
  });

  test('preserves special characters unrelated to HTML', () => {
    expect(sanitizeString('AT&T Stadium — Dallas, TX')).toBe('AT&T Stadium — Dallas, TX');
  });

  test('handles malformed/incomplete HTML tag gracefully (no crash)', () => {
    const result = sanitizeString('Zone A<div incomplete');
    expect(typeof result).toBe('string');
  });
});

// ─── Suite 2: sanitizeNumber ──────────────────────────────────────────────────
describe('sanitizeNumber — numeric validation and clamping', () => {
  test('returns the number unchanged when within default range', () => {
    expect(sanitizeNumber(500)).toBe(500);
  });

  test('returns 0 for min boundary (default min)', () => {
    expect(sanitizeNumber(0)).toBe(0);
  });

  test('returns 1000000 for max boundary (default max)', () => {
    expect(sanitizeNumber(1_000_000)).toBe(1_000_000);
  });

  test('clamps negative value to default min (0)', () => {
    expect(sanitizeNumber(-100)).toBe(0);
  });

  test('clamps value above default max to 1000000', () => {
    expect(sanitizeNumber(9_999_999)).toBe(1_000_000);
  });

  test('returns min for NaN input', () => {
    expect(sanitizeNumber(NaN)).toBe(0);
  });

  test('returns min for non-numeric string input', () => {
    expect(sanitizeNumber('abc')).toBe(0);
  });

  test('parses a valid numeric string correctly', () => {
    expect(sanitizeNumber('82500')).toBe(82500);
  });

  test('parses a float string and returns its numeric value', () => {
    expect(sanitizeNumber('3.14')).toBeCloseTo(3.14, 2);
  });

  test('clamps to custom min when value is below it', () => {
    expect(sanitizeNumber(-5, 1, 100)).toBe(1);
  });

  test('clamps to custom max when value exceeds it', () => {
    expect(sanitizeNumber(200, 0, 100)).toBe(100);
  });

  test('returns custom min for NaN when custom min is set', () => {
    expect(sanitizeNumber(NaN, 5, 500)).toBe(5);
  });

  test('handles value exactly at custom min boundary', () => {
    expect(sanitizeNumber(10, 10, 500)).toBe(10);
  });

  test('handles value exactly at custom max boundary', () => {
    expect(sanitizeNumber(500, 10, 500)).toBe(500);
  });

  test('returns 0 for undefined input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeNumber(undefined as any)).toBe(0);
  });

  test('returns 0 for null input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeNumber(null as any)).toBe(0);
  });

  test('handles boolean true (coerces to 1)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeNumber(true as any)).toBe(1);
  });

  test('handles boolean false (coerces to 0)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeNumber(false as any)).toBe(0);
  });

  test('handles array coercible to single number', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeNumber([42] as any)).toBe(42);
  });

  test('clamps stadium capacity correctly (0 to 100000)', () => {
    expect(sanitizeNumber(-1, 0, 100_000)).toBe(0);
    expect(sanitizeNumber(82500, 0, 100_000)).toBe(82500);
    expect(sanitizeNumber(999_999, 0, 100_000)).toBe(100_000);
  });
});

// ─── Suite 3: sanitizeLength ──────────────────────────────────────────────────
describe('sanitizeLength — chat input length enforcement', () => {
  test('returns the string unchanged when under max length', () => {
    expect(sanitizeLength('Where is Gate A?', 100)).toBe('Where is Gate A?');
  });

  test('truncates a string that exceeds maxLen', () => {
    const long = 'A'.repeat(600);
    const result = sanitizeLength(long, 500);
    expect(result.length).toBe(501); // 500 chars + ellipsis character
    expect(result.endsWith('…')).toBe(true);
  });

  test('truncates and strips HTML before length check', () => {
    const htmlLong = '<b>' + 'X'.repeat(510) + '</b>';
    const result = sanitizeLength(htmlLong, 500);
    expect(result).not.toContain('<b>');
    expect(result.endsWith('…')).toBe(true);
  });

  test('returns empty string for empty input', () => {
    expect(sanitizeLength('', 100)).toBe('');
  });

  test('returns exactly maxLen chars + ellipsis when string is exactly maxLen+1', () => {
    const input = 'B'.repeat(501);
    const result = sanitizeLength(input, 500);
    expect(result).toBe('B'.repeat(500) + '…');
  });

  test('uses default maxLen of 500 when not specified', () => {
    const input = 'C'.repeat(501);
    const result = sanitizeLength(input);
    expect(result.length).toBe(501);
  });
});
