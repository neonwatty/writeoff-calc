"use client";

import { useState } from 'react';
import { parseCurrencyInput, addCommas } from '@/lib/format';

interface PurchaseInputProps {
  value: number;
  onChange: (amount: number) => void;
}

export default function PurchaseInput({ value, onChange }: PurchaseInputProps) {
  const [editing, setEditing] = useState(false);
  const [rawValue, setRawValue] = useState('');

  const displayValue = editing
    ? rawValue
    : value > 0
      ? addCommas(String(value))
      : '';

  return (
    <div className="purchase-section">
      <div className="section-label">Business Purchase</div>
      <div className="purchase-input-wrap">
        <span className="dollar">$</span>
        <input
          className="purchase-input"
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={displayValue}
          onFocus={() => {
            setEditing(true);
            setRawValue(value > 0 ? String(value) : '');
          }}
          onBlur={() => {
            setEditing(false);
          }}
          onChange={(e) => {
            const input = e.target.value;
            setRawValue(input);
            const parsed = parseCurrencyInput(input);
            if (!isNaN(parsed)) {
              onChange(Math.max(0, parsed));
            }
          }}
        />
      </div>
    </div>
  );
}
