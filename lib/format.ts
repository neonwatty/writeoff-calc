export function addCommas(n: string): string {
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatCurrency(amount: number, options: { sign?: boolean } = {}): string {
  const abs = Math.abs(amount);
  const [whole, frac] = abs.toFixed(2).split('.');
  const formatted = `$${addCommas(whole)}.${frac}`;
  if (options.sign) {
    return amount < 0 ? `-${formatted}` : `+${formatted}`;
  }
  return amount < 0 ? `-${formatted}` : formatted;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[$,\s]/g, '');
  if (cleaned === '') return 0;
  return parseFloat(cleaned);
}
