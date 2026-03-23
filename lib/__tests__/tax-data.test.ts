import { describe, it, expect } from 'vitest'
import { getTaxData, FilingStatus, TaxYear } from '../tax-data'

describe('getTaxData', () => {
  describe('2025 single brackets', () => {
    it('returns 7 brackets for 2025 single', () => {
      const data = getTaxData(2025, 'single')
      expect(data.brackets).toHaveLength(7)
    })

    it('has correct bracket floors for 2025 single', () => {
      const { brackets } = getTaxData(2025, 'single')
      expect(brackets[0]).toEqual({ rate: 0.1, floor: 0 })
      expect(brackets[1]).toEqual({ rate: 0.12, floor: 11925 })
      expect(brackets[2]).toEqual({ rate: 0.22, floor: 48475 })
      expect(brackets[3]).toEqual({ rate: 0.24, floor: 103350 })
      expect(brackets[4]).toEqual({ rate: 0.32, floor: 197300 })
      expect(brackets[5]).toEqual({ rate: 0.35, floor: 250525 })
      expect(brackets[6]).toEqual({ rate: 0.37, floor: 626350 })
    })
  })

  describe('2025 MFJ brackets', () => {
    it('has correct bracket floors for 2025 MFJ', () => {
      const { brackets } = getTaxData(2025, 'mfj')
      expect(brackets[0]).toEqual({ rate: 0.1, floor: 0 })
      expect(brackets[1]).toEqual({ rate: 0.12, floor: 23850 })
      expect(brackets[2]).toEqual({ rate: 0.22, floor: 96950 })
      expect(brackets[3]).toEqual({ rate: 0.24, floor: 206700 })
      expect(brackets[4]).toEqual({ rate: 0.32, floor: 394600 })
      expect(brackets[5]).toEqual({ rate: 0.35, floor: 501050 })
      expect(brackets[6]).toEqual({ rate: 0.37, floor: 751600 })
    })
  })

  describe('2025 MFS brackets', () => {
    it('has correct bracket floors for 2025 MFS', () => {
      const { brackets } = getTaxData(2025, 'mfs')
      expect(brackets[6]).toEqual({ rate: 0.37, floor: 375800 })
    })
  })

  describe('2025 HoH brackets', () => {
    it('has correct bracket floors for 2025 HoH', () => {
      const { brackets } = getTaxData(2025, 'hoh')
      expect(brackets[1]).toEqual({ rate: 0.12, floor: 17000 })
      expect(brackets[2]).toEqual({ rate: 0.22, floor: 64850 })
      expect(brackets[5]).toEqual({ rate: 0.35, floor: 250500 })
      expect(brackets[6]).toEqual({ rate: 0.37, floor: 626350 })
    })
  })

  describe('2026 brackets', () => {
    it('has correct bracket floors for 2026 single', () => {
      const { brackets } = getTaxData(2026, 'single')
      expect(brackets[1]).toEqual({ rate: 0.12, floor: 12400 })
      expect(brackets[2]).toEqual({ rate: 0.22, floor: 50400 })
      expect(brackets[3]).toEqual({ rate: 0.24, floor: 105700 })
      expect(brackets[4]).toEqual({ rate: 0.32, floor: 201775 })
      expect(brackets[5]).toEqual({ rate: 0.35, floor: 256225 })
      expect(brackets[6]).toEqual({ rate: 0.37, floor: 640600 })
    })

    it('has correct bracket floors for 2026 MFJ', () => {
      const { brackets } = getTaxData(2026, 'mfj')
      expect(brackets[1]).toEqual({ rate: 0.12, floor: 24800 })
      expect(brackets[2]).toEqual({ rate: 0.22, floor: 100800 })
      expect(brackets[3]).toEqual({ rate: 0.24, floor: 211400 })
      expect(brackets[4]).toEqual({ rate: 0.32, floor: 403550 })
      expect(brackets[5]).toEqual({ rate: 0.35, floor: 512450 })
      expect(brackets[6]).toEqual({ rate: 0.37, floor: 768700 })
    })

    it('has correct bracket floors for 2026 MFS', () => {
      const { brackets } = getTaxData(2026, 'mfs')
      expect(brackets[6]).toEqual({ rate: 0.37, floor: 384350 })
    })

    it('has correct bracket floors for 2026 HoH', () => {
      const { brackets } = getTaxData(2026, 'hoh')
      expect(brackets[1]).toEqual({ rate: 0.12, floor: 17700 })
      expect(brackets[2]).toEqual({ rate: 0.22, floor: 67450 })
      expect(brackets[4]).toEqual({ rate: 0.32, floor: 201750 })
      expect(brackets[5]).toEqual({ rate: 0.35, floor: 256200 })
      expect(brackets[6]).toEqual({ rate: 0.37, floor: 640600 })
    })
  })

  describe('standard deductions', () => {
    it('returns correct standard deductions for 2025', () => {
      expect(getTaxData(2025, 'single').standardDeduction).toBe(15750)
      expect(getTaxData(2025, 'mfj').standardDeduction).toBe(31500)
      expect(getTaxData(2025, 'mfs').standardDeduction).toBe(15750)
      expect(getTaxData(2025, 'hoh').standardDeduction).toBe(23625)
    })

    it('returns correct standard deductions for 2026', () => {
      expect(getTaxData(2026, 'single').standardDeduction).toBe(16100)
      expect(getTaxData(2026, 'mfj').standardDeduction).toBe(32200)
      expect(getTaxData(2026, 'mfs').standardDeduction).toBe(16100)
      expect(getTaxData(2026, 'hoh').standardDeduction).toBe(24150)
    })
  })

  describe('SS wage base', () => {
    it('returns 176100 for 2025', () => {
      expect(getTaxData(2025, 'single').ssWageBase).toBe(176100)
    })

    it('returns 184500 for 2026', () => {
      expect(getTaxData(2026, 'single').ssWageBase).toBe(184500)
    })

    it('is consistent across filing statuses for the same year', () => {
      expect(getTaxData(2025, 'mfj').ssWageBase).toBe(176100)
      expect(getTaxData(2026, 'mfj').ssWageBase).toBe(184500)
    })
  })

  describe('SE tax rates', () => {
    it('has correct fixed SE tax rates', () => {
      const data = getTaxData(2025, 'single')
      expect(data.ssRate).toBe(0.124)
      expect(data.medicareRate).toBe(0.029)
      expect(data.addlMedicareRate).toBe(0.009)
      expect(data.seIncomeFactor).toBe(0.9235)
    })

    it('SE tax rates are the same for 2026', () => {
      const data = getTaxData(2026, 'mfj')
      expect(data.ssRate).toBe(0.124)
      expect(data.medicareRate).toBe(0.029)
      expect(data.addlMedicareRate).toBe(0.009)
      expect(data.seIncomeFactor).toBe(0.9235)
    })
  })

  describe('additional Medicare thresholds', () => {
    it('is $200,000 for single', () => {
      expect(getTaxData(2025, 'single').addlMedicareThreshold).toBe(200000)
      expect(getTaxData(2026, 'single').addlMedicareThreshold).toBe(200000)
    })

    it('is $250,000 for MFJ', () => {
      expect(getTaxData(2025, 'mfj').addlMedicareThreshold).toBe(250000)
      expect(getTaxData(2026, 'mfj').addlMedicareThreshold).toBe(250000)
    })

    it('is $125,000 for MFS', () => {
      expect(getTaxData(2025, 'mfs').addlMedicareThreshold).toBe(125000)
      expect(getTaxData(2026, 'mfs').addlMedicareThreshold).toBe(125000)
    })

    it('is $200,000 for HoH', () => {
      expect(getTaxData(2025, 'hoh').addlMedicareThreshold).toBe(200000)
      expect(getTaxData(2026, 'hoh').addlMedicareThreshold).toBe(200000)
    })
  })

  describe('QBI rate', () => {
    it('is 0.20 for all year/filing status combinations', () => {
      const statuses: FilingStatus[] = ['single', 'mfj', 'mfs', 'hoh']
      const years: TaxYear[] = [2025, 2026]
      for (const year of years) {
        for (const status of statuses) {
          expect(getTaxData(year, status).qbiRate).toBe(0.2)
        }
      }
    })
  })

  describe('all year/filing status combinations', () => {
    const statuses: FilingStatus[] = ['single', 'mfj', 'mfs', 'hoh']
    const years: TaxYear[] = [2025, 2026]

    for (const year of years) {
      for (const status of statuses) {
        it(`returns valid data for ${year} ${status}`, () => {
          const data = getTaxData(year, status)
          expect(data.brackets).toHaveLength(7)
          expect(data.standardDeduction).toBeGreaterThan(0)
          expect(data.ssWageBase).toBeGreaterThan(0)
          expect(data.qbiRate).toBe(0.2)
        })
      }
    }
  })
})
