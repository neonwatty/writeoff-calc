"use client";

import { useMemo } from 'react';
import { TaxProfile, computeSavings } from '@/lib/tax-engine';
import { formatCurrency, formatPercent } from '@/lib/format';

interface QuickCompareProps {
  profile: TaxProfile;
  onSelectAmount: (amount: number) => void;
}

const PRICE_POINTS = [500, 2500, 5000, 10000];

export default function QuickCompare({ profile, onSelectAmount }: QuickCompareProps) {
  const results = useMemo(() => {
    return PRICE_POINTS.map((amount) => ({
      amount,
      savings: computeSavings(profile, amount),
    }));
  }, [profile]);

  return (
    <div className="quick-compare">
      <div className="section-label">Quick Compare</div>
      <div className="compare-row">
        {results.map(({ amount, savings }) => (
          <div
            className="compare-item"
            key={amount}
            role="button"
            tabIndex={0}
            onClick={() => onSelectAmount(amount)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectAmount(amount);
              }
            }}
          >
            <div className="price">{formatCurrency(amount)}</div>
            <div className="discount">{formatPercent(savings.discountPct)}</div>
            <div className="effective">&rarr; {formatCurrency(savings.effectiveCost)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
