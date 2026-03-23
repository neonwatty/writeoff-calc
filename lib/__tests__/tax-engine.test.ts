import { describe, it, expect } from 'vitest';
import { computeTaxLiability, computeSavings, TaxProfile } from '../tax-engine';

// Base profile used throughout: $150K W-2, $80K LLC, Single, Arizona, 2025
const baseProfile: TaxProfile = {
  w2Income: 150_000,
  llcNetIncome: 80_000,
  filingStatus: 'single',
  taxYear: 2025,
  state: 'Arizona',
};

describe('computeTaxLiability', () => {
  describe('SE tax components (base profile)', () => {
    it('computes SE earnings = LLC_net × 0.9235', () => {
      const result = computeTaxLiability(baseProfile);
      expect(result.seEarnings).toBeCloseTo(73_880, 0);
    });

    it('computes remaining SS room = wage_base - W2 income', () => {
      const result = computeTaxLiability(baseProfile);
      expect(result.remainingSSRoom).toBeCloseTo(26_100, 0);
    });

    it('computes SS tax = min(SE_earnings, remaining_SS_room) × 0.124', () => {
      const result = computeTaxLiability(baseProfile);
      expect(result.ssTax).toBeCloseTo(3_236.40, 1);
    });

    it('computes Medicare tax = SE_earnings × 0.029', () => {
      const result = computeTaxLiability(baseProfile);
      expect(result.medicareTax).toBeCloseTo(2_142.52, 1);
    });

    it('computes additional Medicare tax on SE earnings above threshold gap', () => {
      const result = computeTaxLiability(baseProfile);
      // threshold=200k, W2=150k, gap=50k; SE_earnings=73880; excess=23880; tax=23880×0.009
      expect(result.addlMedicareTax).toBeCloseTo(214.92, 1);
    });

    it('total SE tax sums SS + Medicare + addl Medicare', () => {
      const result = computeTaxLiability(baseProfile);
      expect(result.seTax).toBeCloseTo(5_593.84, 1);
    });

    it('deductible half SE = (SS + Medicare) × 0.5 (no addl Medicare)', () => {
      const result = computeTaxLiability(baseProfile);
      expect(result.deductibleHalfSE).toBeCloseTo(2_689.46, 1);
    });
  });

  describe('AGI and deductions (base profile)', () => {
    it('AGI = W2 + LLC_net - deductible_half_SE', () => {
      const result = computeTaxLiability(baseProfile);
      expect(result.agi).toBeCloseTo(227_310.54, 1);
    });

    it('QBI = LLC_net - deductible_half_SE', () => {
      const result = computeTaxLiability(baseProfile);
      expect(result.qbi).toBeCloseTo(77_310.54, 1);
    });

    it('QBI deduction = min(QBI × 0.20, (AGI - std_deduction) × 0.20)', () => {
      const result = computeTaxLiability(baseProfile);
      expect(result.qbiDeduction).toBeCloseTo(15_462.11, 1);
    });

    it('standard deduction is 15750 for 2025 single', () => {
      const result = computeTaxLiability(baseProfile);
      expect(result.standardDeduction).toBe(15_750);
    });

    it('taxable income = AGI - standard deduction - QBI deduction', () => {
      const result = computeTaxLiability(baseProfile);
      expect(result.taxableIncome).toBeCloseTo(196_098.43, 1);
    });
  });

  describe('federal tax (base profile)', () => {
    it('federal tax is correct via progressive brackets', () => {
      const result = computeTaxLiability(baseProfile);
      // 10%: 11925 × 0.10 = 1192.50
      // 12%: 36550 × 0.12 = 4386.00
      // 22%: 54875 × 0.22 = 12072.50
      // 24%: 92748.43 × 0.24 = 22259.62
      // total ≈ 39910.62
      expect(result.federalTax).toBeCloseTo(39_910.62, 0);
    });

    it('marginal federal rate is 0.24 for the base profile', () => {
      const result = computeTaxLiability(baseProfile);
      expect(result.marginalFederalRate).toBe(0.24);
    });
  });

  describe('state tax (base profile, Arizona)', () => {
    it('state tax uses AGI as taxable base (AZ has no state standard deduction)', () => {
      const result = computeTaxLiability(baseProfile);
      // Arizona: 2.5% flat on full AGI of 227310.54 = 5682.76
      expect(result.stateTax).toBeCloseTo(5_682.76, 1);
    });
  });

  describe('total tax (base profile)', () => {
    it('total tax = federal + SE + state', () => {
      const result = computeTaxLiability(baseProfile);
      const expected = result.federalTax + result.seTax + result.stateTax;
      expect(result.totalTax).toBeCloseTo(expected, 2);
    });
  });

  describe('edge case: W-2 = 0', () => {
    const zeroW2Profile: TaxProfile = {
      ...baseProfile,
      w2Income: 0,
    };

    it('remaining SS room equals full wage base when W2 = 0', () => {
      const result = computeTaxLiability(zeroW2Profile);
      expect(result.remainingSSRoom).toBe(176_100);
    });

    it('SS tax uses full SE earnings when W2 = 0', () => {
      const result = computeTaxLiability(zeroW2Profile);
      // SE_earnings=73880, wage_base=176100, so SS = 73880 × 0.124
      expect(result.ssTax).toBeCloseTo(73_880 * 0.124, 2);
    });
  });

  describe('edge case: negative LLC net income', () => {
    const negativeLLCProfile: TaxProfile = {
      ...baseProfile,
      llcNetIncome: -5_000,
    };

    it('SE earnings = 0 when LLC net is negative', () => {
      const result = computeTaxLiability(negativeLLCProfile);
      expect(result.seEarnings).toBe(0);
    });

    it('all SE components = 0 when LLC net is negative', () => {
      const result = computeTaxLiability(negativeLLCProfile);
      expect(result.seTax).toBe(0);
      expect(result.ssTax).toBe(0);
      expect(result.medicareTax).toBe(0);
      expect(result.addlMedicareTax).toBe(0);
      expect(result.deductibleHalfSE).toBe(0);
    });
  });

  describe('edge case: income below standard deduction', () => {
    const lowIncomeProfile: TaxProfile = {
      ...baseProfile,
      w2Income: 5_000,
      llcNetIncome: 0,
    };

    it('federal tax = 0 when taxable income is zero or negative', () => {
      const result = computeTaxLiability(lowIncomeProfile);
      expect(result.federalTax).toBe(0);
    });
  });

  describe('edge case: W-2 exceeds SS wage base', () => {
    const highW2Profile: TaxProfile = {
      ...baseProfile,
      w2Income: 200_000,
    };

    it('SS tax = 0 when W2 exceeds SS wage base', () => {
      const result = computeTaxLiability(highW2Profile);
      expect(result.ssTax).toBe(0);
    });

    it('remaining SS room = 0 when W2 >= wage base', () => {
      const result = computeTaxLiability(highW2Profile);
      expect(result.remainingSSRoom).toBe(0);
    });

    it('Medicare tax still applies on SE earnings when W2 > wage base', () => {
      const result = computeTaxLiability(highW2Profile);
      // SE_earnings = 80000 × 0.9235 = 73880
      expect(result.medicareTax).toBeCloseTo(73_880 * 0.029, 2);
    });
  });
});

describe('computeSavings', () => {
  describe('base profile with $1,000 expense', () => {
    it('totalSavings is between 200 and 400 for $1000 expense', () => {
      const result = computeSavings(baseProfile, 1_000);
      expect(result.totalSavings).toBeGreaterThan(200);
      expect(result.totalSavings).toBeLessThan(400);
    });

    it('effectiveCost = expense - totalSavings', () => {
      const result = computeSavings(baseProfile, 1_000);
      expect(result.effectiveCost).toBeCloseTo(1_000 - result.totalSavings, 2);
    });

    it('discountPct = (totalSavings / expense) × 100', () => {
      const result = computeSavings(baseProfile, 1_000);
      expect(result.discountPct).toBeCloseTo((result.totalSavings / 1_000) * 100, 2);
    });

    it('federalSavings > 0', () => {
      const result = computeSavings(baseProfile, 1_000);
      expect(result.federalSavings).toBeGreaterThan(0);
    });

    it('seSavings > 0', () => {
      const result = computeSavings(baseProfile, 1_000);
      expect(result.seSavings).toBeGreaterThan(0);
    });

    it('stateSavings > 0', () => {
      const result = computeSavings(baseProfile, 1_000);
      expect(result.stateSavings).toBeGreaterThan(0);
    });

    it('qbiOffset > 0', () => {
      const result = computeSavings(baseProfile, 1_000);
      expect(result.qbiOffset).toBeGreaterThan(0);
    });

    it('totalSavings = federalSavings + seSavings + stateSavings (QBI embedded in federal)', () => {
      const result = computeSavings(baseProfile, 1_000);
      expect(result.totalSavings).toBeCloseTo(
        result.federalSavings + result.seSavings + result.stateSavings,
        2
      );
    });

    it('baseline.totalTax > withExpense.totalTax', () => {
      const result = computeSavings(baseProfile, 1_000);
      expect(result.baseline.totalTax).toBeGreaterThan(result.withExpense.totalTax);
    });

    it('w2PreTaxEquivalent is computed (wired in Task 5)', () => {
      const result = computeSavings(baseProfile, 1_000);
      // base profile: $150K W-2 < $176,100 SS wage base → full FICA 7.65%
      // marginal federal 24%, AZ 2.5%, FICA 7.65% → total ~34.15%
      // $1000 / (1 - 0.3415) ≈ $1518
      expect(result.w2PreTaxEquivalent).toBeGreaterThan(1_500);
      expect(result.w2PreTaxEquivalent).toBeCloseTo(1518.6, 0);
    });
  });

  describe('$0 expense returns all zeros', () => {
    it('totalSavings = 0', () => {
      const result = computeSavings(baseProfile, 0);
      expect(result.totalSavings).toBe(0);
    });

    it('effectiveCost = 0', () => {
      const result = computeSavings(baseProfile, 0);
      expect(result.effectiveCost).toBe(0);
    });

    it('discountPct = 0', () => {
      const result = computeSavings(baseProfile, 0);
      expect(result.discountPct).toBe(0);
    });

    it('federalSavings = 0', () => {
      const result = computeSavings(baseProfile, 0);
      expect(result.federalSavings).toBe(0);
    });

    it('seSavings = 0', () => {
      const result = computeSavings(baseProfile, 0);
      expect(result.seSavings).toBe(0);
    });

    it('stateSavings = 0', () => {
      const result = computeSavings(baseProfile, 0);
      expect(result.stateSavings).toBe(0);
    });

    it('qbiOffset = 0', () => {
      const result = computeSavings(baseProfile, 0);
      expect(result.qbiOffset).toBe(0);
    });

    it('w2PreTaxEquivalent = 0', () => {
      const result = computeSavings(baseProfile, 0);
      expect(result.w2PreTaxEquivalent).toBe(0);
    });
  });

  describe('edge case: expense > LLC net income', () => {
    it('withExpense.seTax = 0 when expense exceeds LLC net income', () => {
      // expense = 100k > llcNetIncome = 80k, so LLC_net - expense = -20k (negative)
      const result = computeSavings(baseProfile, 100_000);
      expect(result.withExpense.seTax).toBe(0);
    });

    it('totalSavings > 0 even when expense exceeds LLC net income', () => {
      const result = computeSavings(baseProfile, 100_000);
      expect(result.totalSavings).toBeGreaterThan(0);
    });
  });

  describe('edge case: large expense ($50K) crosses bracket boundary', () => {
    it('discount% for $50K expense is less than for $1K expense', () => {
      const small = computeSavings(baseProfile, 1_000);
      const large = computeSavings(baseProfile, 50_000);
      expect(large.discountPct).toBeLessThan(small.discountPct);
    });

    it('discount% for $50K expense is greater than 15%', () => {
      const large = computeSavings(baseProfile, 50_000);
      expect(large.discountPct).toBeGreaterThan(15);
    });
  });
});
