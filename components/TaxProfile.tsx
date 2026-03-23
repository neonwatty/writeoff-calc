"use client";

import { useState } from 'react';
import type { TaxProfile as TaxProfileType } from '@/lib/tax-engine';
import { ALL_STATES, STATE_WARNINGS } from '@/lib/state-tax-data';
import { parseCurrencyInput } from '@/lib/format';

interface TaxProfileProps {
  profile: TaxProfileType;
  onChange: (profile: TaxProfileType) => void;
}

function formatForDisplay(amount: number): string {
  // Format as $150,000 (no decimals for cleaner look)
  const abs = Math.abs(amount);
  const whole = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = `$${whole}`;
  return amount < 0 ? `-${formatted}` : formatted;
}

export default function TaxProfile({ profile, onChange }: TaxProfileProps) {
  const [w2Display, setW2Display] = useState(() => formatForDisplay(profile.w2Income));
  const [llcDisplay, setLlcDisplay] = useState(() => formatForDisplay(profile.llcNetIncome));

  const stateWarning = STATE_WARNINGS[profile.state];

  function handleW2Focus() {
    setW2Display(profile.w2Income === 0 ? '' : String(profile.w2Income));
  }

  function handleW2Blur(e: React.FocusEvent<HTMLInputElement>) {
    const value = parseCurrencyInput(e.target.value);
    const newProfile = { ...profile, w2Income: isNaN(value) ? 0 : value };
    onChange(newProfile);
    setW2Display(formatForDisplay(newProfile.w2Income));
  }

  function handleW2Change(e: React.ChangeEvent<HTMLInputElement>) {
    setW2Display(e.target.value);
  }

  function handleLlcFocus() {
    setLlcDisplay(profile.llcNetIncome === 0 ? '' : String(profile.llcNetIncome));
  }

  function handleLlcBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = parseCurrencyInput(e.target.value);
    const newProfile = { ...profile, llcNetIncome: isNaN(value) ? 0 : value };
    onChange(newProfile);
    setLlcDisplay(formatForDisplay(newProfile.llcNetIncome));
  }

  function handleLlcChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLlcDisplay(e.target.value);
  }

  return (
    <div className="profile-section">
      <div className="section-label">Your Tax Profile</div>

      <div className="profile-row">
        <span className="label">W-2 Income</span>
        <input
          type="text"
          inputMode="numeric"
          value={w2Display}
          onFocus={handleW2Focus}
          onBlur={handleW2Blur}
          onChange={handleW2Change}
        />
      </div>
      <div
        style={{
          fontSize: '10px',
          color: '#999',
          lineHeight: '1.4',
          marginBottom: '8px',
          textAlign: 'right',
        }}
      >
        Sets your tax bracket and affects SE tax on LLC income — both change your write-off savings
      </div>

      <div className="profile-row">
        <span className="label">LLC Net Income</span>
        <input
          type="text"
          inputMode="numeric"
          value={llcDisplay}
          onFocus={handleLlcFocus}
          onBlur={handleLlcBlur}
          onChange={handleLlcChange}
        />
      </div>

      <div className="profile-row">
        <span className="label">Filing Status</span>
        <select
          value={profile.filingStatus}
          onChange={(e) =>
            onChange({
              ...profile,
              filingStatus: e.target.value as TaxProfileType['filingStatus'],
            })
          }
        >
          <option value="single">Single</option>
          <option value="mfj">Married Filing Jointly</option>
          <option value="mfs">Married Filing Separately</option>
          <option value="hoh">Head of Household</option>
        </select>
      </div>

      <div className="profile-row" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <span className="label" style={{ paddingTop: '2px' }}>State</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <select
            value={profile.state}
            onChange={(e) => onChange({ ...profile, state: e.target.value })}
          >
            {ALL_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {stateWarning && (
            <span
              style={{
                fontSize: '10px',
                color: '#999',
                marginTop: '4px',
                maxWidth: '200px',
                textAlign: 'right',
                lineHeight: '1.4',
              }}
            >
              {stateWarning}
            </span>
          )}
        </div>
      </div>

      <div className="profile-row">
        <span className="label">Tax Year</span>
        <select
          value={profile.taxYear}
          onChange={(e) =>
            onChange({ ...profile, taxYear: Number(e.target.value) as TaxProfileType['taxYear'] })
          }
        >
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>
      </div>
    </div>
  );
}
