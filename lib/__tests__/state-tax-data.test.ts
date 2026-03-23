import { describe, it, expect } from 'vitest'
import {
  ALL_STATES,
  NO_INCOME_TAX_STATES,
  STATE_WARNINGS,
  getStateTaxInfo,
  calculateStateTax,
  getStateMarginalRate,
} from '../state-tax-data'

describe('ALL_STATES', () => {
  it('has exactly 51 entries (50 states + DC)', () => {
    expect(ALL_STATES).toHaveLength(51)
  })

  it('is sorted alphabetically', () => {
    const sorted = [...ALL_STATES].sort((a, b) => a.localeCompare(b))
    expect(ALL_STATES).toEqual(sorted)
  })

  it('includes District of Columbia', () => {
    expect(ALL_STATES).toContain('District of Columbia')
  })
})

describe('NO_INCOME_TAX_STATES', () => {
  it('has exactly 9 entries', () => {
    expect(NO_INCOME_TAX_STATES).toHaveLength(9)
  })

  it('contains expected states', () => {
    expect(NO_INCOME_TAX_STATES).toContain('Alaska')
    expect(NO_INCOME_TAX_STATES).toContain('Florida')
    expect(NO_INCOME_TAX_STATES).toContain('Nevada')
    expect(NO_INCOME_TAX_STATES).toContain('New Hampshire')
    expect(NO_INCOME_TAX_STATES).toContain('South Dakota')
    expect(NO_INCOME_TAX_STATES).toContain('Tennessee')
    expect(NO_INCOME_TAX_STATES).toContain('Texas')
    expect(NO_INCOME_TAX_STATES).toContain('Washington')
    expect(NO_INCOME_TAX_STATES).toContain('Wyoming')
  })
})

describe('STATE_WARNINGS', () => {
  it('has warning for Maryland', () => {
    expect(STATE_WARNINGS['Maryland']).toContain('county/local income taxes')
  })

  it('has warning for Indiana', () => {
    expect(STATE_WARNINGS['Indiana']).toContain('county/local income taxes')
  })

  it('has warning for California mentioning LLC franchise tax', () => {
    expect(STATE_WARNINGS['California']).toContain('$800')
  })

  it('has warning for Ohio', () => {
    expect(STATE_WARNINGS['Ohio']).toContain('local/municipal income taxes')
  })

  it('has warning for Pennsylvania', () => {
    expect(STATE_WARNINGS['Pennsylvania']).toContain('local/municipal income taxes')
  })
})

describe('getStateTaxInfo', () => {
  it('returns null for unknown state', () => {
    expect(getStateTaxInfo('Nonexistent State')).toBeNull()
  })

  it('returns null for no-tax states', () => {
    expect(getStateTaxInfo('Texas')).toBeNull()
    expect(getStateTaxInfo('Florida')).toBeNull()
  })

  it('returns brackets for a flat-rate state', () => {
    const info = getStateTaxInfo('Arizona')
    expect(info).not.toBeNull()
    expect(info).toBeInstanceOf(Array)
    expect(info![0]).toMatchObject({ rate: 0.025, floor: 0 })
  })

  it('returns brackets for a progressive state', () => {
    const info = getStateTaxInfo('California')
    expect(info).not.toBeNull()
    expect(info!.length).toBeGreaterThan(2)
  })

  it('brackets use { rate, floor } shape', () => {
    const info = getStateTaxInfo('New York')
    expect(info).not.toBeNull()
    info!.forEach((bracket) => {
      expect(bracket).toHaveProperty('rate')
      expect(bracket).toHaveProperty('floor')
      expect(typeof bracket.rate).toBe('number')
      expect(typeof bracket.floor).toBe('number')
    })
  })
})

describe('calculateStateTax - no-tax states', () => {
  it('returns 0 for Texas', () => {
    expect(calculateStateTax('Texas', 100_000)).toBe(0)
  })

  it('returns 0 for Florida', () => {
    expect(calculateStateTax('Florida', 200_000)).toBe(0)
  })

  it('returns 0 for all no-tax states', () => {
    for (const state of NO_INCOME_TAX_STATES) {
      expect(calculateStateTax(state, 100_000)).toBe(0)
    }
  })
})

describe('calculateStateTax - zero income', () => {
  it('returns 0 for any state at $0 income', () => {
    expect(calculateStateTax('California', 0)).toBe(0)
    expect(calculateStateTax('New York', 0)).toBe(0)
    expect(calculateStateTax('Arizona', 0)).toBe(0)
    expect(calculateStateTax('Texas', 0)).toBe(0)
  })
})

describe('calculateStateTax - flat-rate spot checks', () => {
  it('Arizona $100K → $2,500', () => {
    expect(calculateStateTax('Arizona', 100_000)).toBe(2_500)
  })

  it('Illinois $100K → $4,950', () => {
    expect(calculateStateTax('Illinois', 100_000)).toBe(4_950)
  })

  it('Pennsylvania $100K → $3,070', () => {
    expect(calculateStateTax('Pennsylvania', 100_000)).toBe(3_070)
  })

  it('Colorado $100K → $4,400', () => {
    expect(calculateStateTax('Colorado', 100_000)).toBe(4_400)
  })

  it('Michigan $100K → $4,250', () => {
    expect(calculateStateTax('Michigan', 100_000)).toBe(4_250)
  })
})

describe('calculateStateTax - progressive spot checks', () => {
  // CA $100K: bracket calc
  // $0–$11,079 @ 1%   = $110.79
  // $11,079–$26,264 @ 2% = $303.70
  // $26,264–$41,452 @ 4% = $607.52
  // $41,452–$57,542 @ 6% = $965.40
  // $57,542–$72,724 @ 8% = $1,214.56
  // $72,724–$100,000 @ 9.3% = $2,536.69
  // Total ≈ $5,738.66
  it('California $100K → ~$5,739 (within $50)', () => {
    const tax = calculateStateTax('California', 100_000)
    expect(tax).toBeGreaterThan(5_689)
    expect(tax).toBeLessThan(5_789)
  })

  it('New York $100K → between $4,000 and $6,500', () => {
    const tax = calculateStateTax('New York', 100_000)
    expect(tax).toBeGreaterThan(4_000)
    expect(tax).toBeLessThan(6_500)
  })

  it('Oregon $100K → reasonable range', () => {
    const tax = calculateStateTax('Oregon', 100_000)
    expect(tax).toBeGreaterThan(7_000)
    expect(tax).toBeLessThan(10_000)
  })
})

describe('calculateStateTax - Mississippi (flat with exemption)', () => {
  it('$5,000 income → $0 (below exemption)', () => {
    expect(calculateStateTax('Mississippi', 5_000)).toBe(0)
  })

  it('$100K → 4.4% on amount above $10K = $3,960', () => {
    expect(calculateStateTax('Mississippi', 100_000)).toBe(3_960)
  })
})

describe('getStateMarginalRate', () => {
  it('returns 0 for no-tax states', () => {
    expect(getStateMarginalRate('Texas', 100_000)).toBe(0)
    expect(getStateMarginalRate('Florida', 50_000)).toBe(0)
  })

  it('returns flat rate for flat-rate states', () => {
    expect(getStateMarginalRate('Arizona', 100_000)).toBe(0.025)
    expect(getStateMarginalRate('Illinois', 50_000)).toBe(0.0495)
    expect(getStateMarginalRate('Pennsylvania', 200_000)).toBe(0.0307)
  })

  it('returns correct marginal rate for California at $100K (9.3% bracket)', () => {
    // $100K falls in the 9.3% bracket ($72,724–$371,479)
    expect(getStateMarginalRate('California', 100_000)).toBe(0.093)
  })

  it('returns correct marginal rate for New York at $100K', () => {
    // $100K falls in the 6% bracket ($80,650–$215,400)
    expect(getStateMarginalRate('New York', 100_000)).toBe(0.06)
  })

  it('returns 0 for zero income on progressive state', () => {
    // CA bottom bracket starts at $0 with 1%, so $0 income is in that bracket
    expect(getStateMarginalRate('California', 0)).toBe(0.01)
  })

  it('returns 0 for states with zero bottom bracket at low income', () => {
    // North Dakota: 0% below $48,475
    expect(getStateMarginalRate('North Dakota', 10_000)).toBe(0)
  })
})
