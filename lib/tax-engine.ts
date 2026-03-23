import { getTaxData } from './tax-data';
import { calculateStateTax, getStateStandardDeduction } from './state-tax-data';
import { computeW2PreTaxEquivalent } from './w2-equivalent';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TaxProfile = {
  w2Income: number;
  llcNetIncome: number;
  filingStatus: 'single' | 'mfj' | 'mfs' | 'hoh';
  taxYear: 2025 | 2026;
  state: string;
};

export type TaxResult = {
  federalTax: number;
  seTax: number;
  stateTax: number;
  totalTax: number;
  marginalFederalRate: number;
  seEarnings: number;
  remainingSSRoom: number;
  ssTax: number;
  medicareTax: number;
  addlMedicareTax: number;
  deductibleHalfSE: number;
  agi: number;
  qbi: number;
  qbiDeduction: number;
  standardDeduction: number;
  taxableIncome: number;
};

export type SavingsBreakdown = {
  totalSavings: number;
  effectiveCost: number;
  discountPct: number;
  federalSavings: number;
  seSavings: number;
  stateSavings: number;
  qbiOffset: number;
  w2PreTaxEquivalent: number;
  baseline: TaxResult;
  withExpense: TaxResult;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Applies progressive tax brackets to a given taxable income.
 * Returns { tax, marginalRate }.
 */
function applyBrackets(
  taxableIncome: number,
  brackets: { rate: number; floor: number }[]
): { tax: number; marginalRate: number } {
  if (taxableIncome <= 0) {
    return { tax: 0, marginalRate: brackets[0].rate };
  }

  let tax = 0;
  let marginalRate = brackets[0].rate;

  for (let i = 0; i < brackets.length; i++) {
    const { rate, floor } = brackets[i];
    const ceiling = i + 1 < brackets.length ? brackets[i + 1].floor : Infinity;

    if (taxableIncome <= floor) break;

    const taxableInBracket = Math.min(taxableIncome, ceiling) - floor;
    tax += taxableInBracket * rate;
    marginalRate = rate;
  }

  return { tax, marginalRate };
}

// ─── computeTaxLiability ──────────────────────────────────────────────────────

export function computeTaxLiability(profile: TaxProfile): TaxResult {
  const { w2Income, llcNetIncome, filingStatus, taxYear, state } = profile;
  const taxData = getTaxData(taxYear, filingStatus);
  const {
    brackets,
    standardDeduction,
    ssWageBase,
    ssRate,
    medicareRate,
    addlMedicareRate,
    seIncomeFactor,
    addlMedicareThreshold,
  } = taxData;

  // ── Step 1: SE Tax ──────────────────────────────────────────────────────────
  let seEarnings = 0;
  let remainingSSRoom = 0;
  let ssTax = 0;
  let medicareTax = 0;
  let addlMedicareTax = 0;
  let deductibleHalfSE = 0;
  let seTax = 0;

  if (llcNetIncome > 0) {
    seEarnings = llcNetIncome * seIncomeFactor;
    remainingSSRoom = Math.max(0, ssWageBase - w2Income);
    ssTax = Math.min(seEarnings, remainingSSRoom) * ssRate;
    medicareTax = seEarnings * medicareRate;

    // Additional Medicare: applies on SE earnings above (threshold - W2 income),
    // i.e. the portion where W2 hasn't already consumed the threshold headroom.
    const thresholdHeadroomUsedByW2 = Math.max(0, addlMedicareThreshold - w2Income);
    const seEarningsAboveThreshold = Math.max(0, seEarnings - thresholdHeadroomUsedByW2);
    addlMedicareTax = seEarningsAboveThreshold * addlMedicareRate;

    // Deductible half: only SS + regular Medicare (not addl Medicare)
    deductibleHalfSE = (ssTax + medicareTax) * 0.5;
    seTax = ssTax + medicareTax + addlMedicareTax;
  }

  // ── Step 2: AGI ─────────────────────────────────────────────────────────────
  const agi = w2Income + llcNetIncome - deductibleHalfSE;

  // ── Step 3: QBI Deduction ───────────────────────────────────────────────────
  const qbi = Math.max(0, llcNetIncome - deductibleHalfSE);
  const qbiDeductionCandidate = Math.min(
    qbi * 0.20,
    Math.max(0, agi - standardDeduction) * 0.20
  );
  const qbiDeduction = Math.max(0, qbiDeductionCandidate);

  // ── Step 4: Taxable Income ───────────────────────────────────────────────────
  const taxableIncome = Math.max(0, agi - standardDeduction - qbiDeduction);

  // ── Step 5: Federal Tax ──────────────────────────────────────────────────────
  const { tax: federalTax, marginalRate: marginalFederalRate } = applyBrackets(
    taxableIncome,
    brackets
  );

  // ── Step 6: State Tax ────────────────────────────────────────────────────────
  // Use state-specific standard deduction (if any) instead of federal
  const stateStdDeduction = getStateStandardDeduction(state);
  const stateTaxableIncome = Math.max(0, agi - stateStdDeduction);
  const stateTax = calculateStateTax(state, stateTaxableIncome);

  // ── Step 7: Total ────────────────────────────────────────────────────────────
  const totalTax = federalTax + seTax + stateTax;

  return {
    federalTax,
    seTax,
    stateTax,
    totalTax,
    marginalFederalRate,
    seEarnings,
    remainingSSRoom,
    ssTax,
    medicareTax,
    addlMedicareTax,
    deductibleHalfSE,
    agi,
    qbi,
    qbiDeduction,
    standardDeduction,
    taxableIncome,
  };
}

// ─── computeSavings ───────────────────────────────────────────────────────────

export function computeSavings(profile: TaxProfile, expense: number): SavingsBreakdown {
  // Short-circuit: $0 expense → all zeros
  if (expense === 0) {
    const baseline = computeTaxLiability(profile);
    return {
      totalSavings: 0,
      effectiveCost: 0,
      discountPct: 0,
      federalSavings: 0,
      seSavings: 0,
      stateSavings: 0,
      qbiOffset: 0,
      w2PreTaxEquivalent: 0,
      baseline,
      withExpense: baseline,
    };
  }

  const baseline = computeTaxLiability(profile);
  const withExpense = computeTaxLiability({
    ...profile,
    llcNetIncome: profile.llcNetIncome - expense,
  });

  const federalSavings = baseline.federalTax - withExpense.federalTax;
  const seSavings = baseline.seTax - withExpense.seTax;
  const stateSavings = baseline.stateTax - withExpense.stateTax;

  // QBI offset: how much the QBI deduction changed (can shift federal savings)
  const qbiOffset = baseline.qbiDeduction - withExpense.qbiDeduction;

  const totalSavings = federalSavings + seSavings + stateSavings;
  const effectiveCost = expense - totalSavings;
  const discountPct = (totalSavings / expense) * 100;

  return {
    totalSavings,
    effectiveCost,
    discountPct,
    federalSavings,
    seSavings,
    stateSavings,
    qbiOffset,
    w2PreTaxEquivalent: computeW2PreTaxEquivalent(
      expense,
      baseline.marginalFederalRate,
      profile.w2Income,
      getTaxData(profile.taxYear, profile.filingStatus).ssWageBase,
      profile.state,
      Math.max(0, baseline.agi - getStateStandardDeduction(profile.state))
    ),
    baseline,
    withExpense,
  };
}
