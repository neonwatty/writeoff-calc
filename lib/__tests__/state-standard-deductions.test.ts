import { describe, it, expect } from 'vitest'
import { getStateStandardDeduction } from '../state-tax-data'

describe('getStateStandardDeduction', () => {
  it('returns 0 for no-income-tax states', () => {
    expect(getStateStandardDeduction('Texas')).toBe(0)
    expect(getStateStandardDeduction('Florida')).toBe(0)
    expect(getStateStandardDeduction('Wyoming')).toBe(0)
  })

  it('returns 0 for states that use AGI directly (no standard deduction)', () => {
    expect(getStateStandardDeduction('Illinois')).toBe(0)
    expect(getStateStandardDeduction('Pennsylvania')).toBe(0)
    expect(getStateStandardDeduction('Michigan')).toBe(0)
  })

  it('returns federal standard deduction for states that conform to federal', () => {
    expect(getStateStandardDeduction('Colorado')).toBe(15_750)
    expect(getStateStandardDeduction('Idaho')).toBe(15_750)
    expect(getStateStandardDeduction('Iowa')).toBe(15_750)
    expect(getStateStandardDeduction('North Dakota')).toBe(15_750)
  })

  it('returns known deductions for major states', () => {
    expect(getStateStandardDeduction('California')).toBe(5_540)
    expect(getStateStandardDeduction('New York')).toBe(8_000)
    expect(getStateStandardDeduction('Oregon')).toBe(2_745)
  })

  it('returns a number for every state with brackets', () => {
    const statesWithBrackets = [
      'Alabama',
      'Arizona',
      'Arkansas',
      'California',
      'Colorado',
      'Connecticut',
      'Delaware',
      'District of Columbia',
      'Georgia',
      'Hawaii',
      'Idaho',
      'Illinois',
      'Indiana',
      'Iowa',
      'Kansas',
      'Kentucky',
      'Louisiana',
      'Maine',
      'Maryland',
      'Massachusetts',
      'Michigan',
      'Minnesota',
      'Mississippi',
      'Missouri',
      'Montana',
      'Nebraska',
      'New Jersey',
      'New Mexico',
      'New York',
      'North Carolina',
      'North Dakota',
      'Ohio',
      'Oklahoma',
      'Oregon',
      'Pennsylvania',
      'Rhode Island',
      'South Carolina',
      'Utah',
      'Vermont',
      'Virginia',
      'West Virginia',
      'Wisconsin',
    ]
    for (const state of statesWithBrackets) {
      const deduction = getStateStandardDeduction(state)
      expect(typeof deduction).toBe('number')
      expect(deduction).toBeGreaterThanOrEqual(0)
    }
  })

  it('returns 0 for unknown states', () => {
    expect(getStateStandardDeduction('Narnia')).toBe(0)
  })
})
