"use client";

import { useState, useEffect } from 'react';
import { TaxProfile, computeTaxLiability, computeSavings, SavingsBreakdown, TaxResult } from '@/lib/tax-engine';
import TaxProfileComponent from '@/components/TaxProfile';
import RatesSummary from '@/components/RatesSummary';

const STORAGE_KEY = 'writeoff-calc-profile';

const DEFAULT_PROFILE: TaxProfile = {
  w2Income: 0,
  llcNetIncome: 0,
  filingStatus: 'single',
  taxYear: 2025,
  state: 'Arizona',
};

function loadProfile(): TaxProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PROFILE;
    const parsed = JSON.parse(stored);
    // Basic validation
    if (
      typeof parsed.w2Income === 'number' &&
      typeof parsed.llcNetIncome === 'number' &&
      ['single', 'mfj', 'mfs', 'hoh'].includes(parsed.filingStatus) &&
      [2025, 2026].includes(parsed.taxYear) &&
      typeof parsed.state === 'string'
    ) {
      return parsed as TaxProfile;
    }
    return DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export default function Calculator() {
  const [profile, setProfile] = useState<TaxProfile>(DEFAULT_PROFILE);
  const [expenseAmount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setProfile(loadProfile());
    setMounted(true);
  }, []);

  // Save to localStorage on profile change (after mount)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore write errors
    }
  }, [profile, mounted]);

  const baseline: TaxResult = computeTaxLiability(profile);
  const breakdown: SavingsBreakdown | null =
    expenseAmount > 0 ? computeSavings(profile, expenseAmount) : null;

  // Suppress unused variable warning for breakdown (used in future tasks)
  void breakdown;

  return (
    <div className="receipt">
      {/* Header */}
      <div className="receipt-header">
        <h1>Write-Off Calculator</h1>
        <div className="subtitle">
          {profile.state} · {profile.taxYear}
        </div>
      </div>

      <TaxProfileComponent profile={profile} onChange={setProfile} />
      <RatesSummary baseline={baseline} state={profile.state} />

      {/* Placeholder sections for Tasks 9 and 10 */}
      {/* PurchaseInput will go here */}
      {/* ResultHero will go here */}
      {/* Breakdown will go here */}
      {/* QuickCompare will go here */}

      {/* Footer */}
      <div className="receipt-footer">
        YOUR DATA STAYS IN THIS BROWSER<br />
        NOTHING IS SENT TO ANY SERVER<br />
        <br />
        FOR ESTIMATION PURPOSES ONLY<br />
        NOT TAX ADVICE · CONSULT YOUR CPA<br />
        * * * THANK YOU * * *
      </div>
    </div>
  );
}
