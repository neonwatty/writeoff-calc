import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercent, parseCurrencyInput, addCommas } from '../format';

describe('formatCurrency', () => {
  it('formats positive numbers', () => expect(formatCurrency(1234.56)).toBe('$1,234.56'));
  it('formats zero', () => expect(formatCurrency(0)).toBe('$0.00'));
  it('formats large numbers', () => expect(formatCurrency(150_000)).toBe('$150,000.00'));
  it('formats with positive sign', () => expect(formatCurrency(249.19, { sign: true })).toBe('+$249.19'));
  it('formats with negative sign', () => expect(formatCurrency(-47.36, { sign: true })).toBe('-$47.36'));
});

describe('formatPercent', () => {
  it('formats with one decimal', () => expect(formatPercent(24.92)).toBe('24.9%'));
  it('formats whole percentages', () => expect(formatPercent(25.0)).toBe('25.0%'));
});

describe('parseCurrencyInput', () => {
  it('parses plain numbers', () => expect(parseCurrencyInput('1000')).toBe(1000));
  it('strips $ and commas', () => expect(parseCurrencyInput('$1,000')).toBe(1000));
  it('handles empty string', () => expect(parseCurrencyInput('')).toBe(0));
  it('handles decimals', () => expect(parseCurrencyInput('1,234.56')).toBe(1234.56));
});

describe('addCommas', () => {
  it('adds commas to thousands', () => expect(addCommas('1000')).toBe('1,000'));
  it('adds commas to millions', () => expect(addCommas('1000000')).toBe('1,000,000'));
  it('leaves small numbers alone', () => expect(addCommas('999')).toBe('999'));
  it('handles single digit', () => expect(addCommas('0')).toBe('0'));
});
