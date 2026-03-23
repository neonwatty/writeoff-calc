import { describe, it, expect } from 'vitest'
import { computeW2PreTaxEquivalent } from '../w2-equivalent'

describe('computeW2PreTaxEquivalent', () => {
  it('computes pre-tax needed when W-2 is above SS wage base (AZ)', () => {
    // marginal federal 24%, FICA Medicare-only 1.45%, AZ 2.5%
    // total marginal = 27.95%
    // $1000 / (1 - 0.2795) = $1388.07
    const result = computeW2PreTaxEquivalent(1_000, 0.24, 200_000, 176_100, 'Arizona', 180_000)
    expect(result).toBeCloseTo(1_388.07, 0)
  })

  it('computes pre-tax needed when W-2 is below SS wage base', () => {
    // marginal federal 22%, FICA full 7.65%, AZ 2.5%
    // total marginal = 32.15%
    // $1000 / (1 - 0.3215) = $1473.48
    const result = computeW2PreTaxEquivalent(1_000, 0.22, 50_000, 176_100, 'Arizona', 40_000)
    expect(result).toBeCloseTo(1_473.48, 0)
  })

  it('returns 0 for $0 expense', () => {
    expect(computeW2PreTaxEquivalent(0, 0.24, 150_000, 176_100, 'Arizona', 100_000)).toBe(0)
  })

  it('handles no-income-tax state', () => {
    // Federal 24% + FICA 1.45% + FL 0% = 25.45%
    // $1000 / (1 - 0.2545) = $1341.12
    const result = computeW2PreTaxEquivalent(1_000, 0.24, 200_000, 176_100, 'Florida', 180_000)
    expect(result).toBeCloseTo(1_341.12, 0)
  })

  it('handles progressive state (California)', () => {
    // Federal 24% + FICA 1.45% + CA marginal rate at $180K ~= 9.3%
    // total = 34.75%, $1000 / (1 - 0.3475) = $1532.57
    const result = computeW2PreTaxEquivalent(1_000, 0.24, 200_000, 176_100, 'California', 180_000)
    expect(result).toBeGreaterThan(1_500)
    expect(result).toBeLessThan(1_600)
  })
})
