import { getStateMarginalRate } from './state-tax-data'

const FICA_SS_RATE = 0.062
const FICA_MEDICARE_RATE = 0.0145

export function computeW2PreTaxEquivalent(
  expenseAmount: number,
  marginalFederalRate: number,
  w2Income: number,
  ssWageBase: number,
  state: string,
  stateTaxableIncome: number,
): number {
  if (expenseAmount === 0) return 0

  const ficaRate =
    w2Income >= ssWageBase
      ? FICA_MEDICARE_RATE // Medicare only (1.45%)
      : FICA_SS_RATE + FICA_MEDICARE_RATE // Full FICA (7.65%)

  const stateMarginalRate = getStateMarginalRate(state, stateTaxableIncome)
  const totalMarginalRate = marginalFederalRate + ficaRate + stateMarginalRate
  return expenseAmount / (1 - totalMarginalRate)
}
