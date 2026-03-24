'use client'

import { useState } from 'react'
import { parseCurrencyInput } from '@/lib/format'

interface ExpenseConfig {
  key: string
  name: string
  defaultAmount: number
  defaultPctType: 'sqft' | 'fixed'
  fixedPct: number
  helper?: string
}

export const EXPENSE_CONFIGS: ExpenseConfig[] = [
  {
    key: 'rent',
    name: 'Rent/Mortgage Interest',
    defaultAmount: 0,
    defaultPctType: 'sqft',
    fixedPct: 0,
    helper: 'For mortgages, enter interest only',
  },
  {
    key: 'internet',
    name: 'Internet',
    defaultAmount: 0,
    defaultPctType: 'fixed',
    fixedPct: 50,
    helper: 'IRS provides no specific % \u2014 use your estimate',
  },
  {
    key: 'phone',
    name: 'Phone',
    defaultAmount: 0,
    defaultPctType: 'fixed',
    fixedPct: 50,
    helper: 'IRS provides no specific % \u2014 use your estimate',
  },
  {
    key: 'electric',
    name: 'Electric',
    defaultAmount: 0,
    defaultPctType: 'sqft',
    fixedPct: 0,
  },
  {
    key: 'insurance',
    name: 'Insurance',
    defaultAmount: 0,
    defaultPctType: 'sqft',
    fixedPct: 0,
  },
  {
    key: 'water',
    name: 'Water/Trash',
    defaultAmount: 0,
    defaultPctType: 'sqft',
    fixedPct: 0,
  },
  {
    key: 'hoa',
    name: 'HOA Fees',
    defaultAmount: 0,
    defaultPctType: 'sqft',
    fixedPct: 0,
    helper: 'Not explicitly addressed by IRS \u2014 consult your CPA',
  },
]

export interface ExpenseState {
  amount: number
  pctOverride: number | null
}

interface HomeOfficeInputsProps {
  officeSqft: number
  homeSqft: number
  sqftPct: number
  expenses: Record<string, ExpenseState>
  onOfficeSqftChange: (v: number) => void
  onHomeSqftChange: (v: number) => void
  onExpenseChange: (key: string, state: ExpenseState) => void
}

function formatForDisplay(amount: number): string {
  const whole = Math.round(Math.abs(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const formatted = `$${whole}`
  return amount < 0 ? `-${formatted}` : formatted
}

function SqftInputs({
  officeSqft,
  homeSqft,
  sqftPct,
  onOfficeSqftChange,
  onHomeSqftChange,
}: {
  officeSqft: number
  homeSqft: number
  sqftPct: number
  onOfficeSqftChange: (v: number) => void
  onHomeSqftChange: (v: number) => void
}) {
  const [officeDisplay, setOfficeDisplay] = useState(() => (officeSqft > 0 ? String(officeSqft) : ''))
  const [homeDisplay, setHomeDisplay] = useState(() => (homeSqft > 0 ? String(homeSqft) : ''))

  return (
    <>
      <div className="profile-row">
        <span className="label">Office sqft</span>
        <input
          type="text"
          inputMode="numeric"
          value={officeDisplay}
          placeholder="0"
          onFocus={() => setOfficeDisplay(officeSqft === 0 ? '' : String(officeSqft))}
          onBlur={(e) => {
            const v = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0
            onOfficeSqftChange(v)
            setOfficeDisplay(v > 0 ? String(v) : '')
          }}
          onChange={(e) => setOfficeDisplay(e.target.value)}
        />
      </div>
      <div className="profile-row">
        <span className="label">Home sqft</span>
        <input
          type="text"
          inputMode="numeric"
          value={homeDisplay}
          placeholder="0"
          onFocus={() => setHomeDisplay(homeSqft === 0 ? '' : String(homeSqft))}
          onBlur={(e) => {
            const v = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0
            onHomeSqftChange(v)
            setHomeDisplay(v > 0 ? String(v) : '')
          }}
          onChange={(e) => setHomeDisplay(e.target.value)}
        />
      </div>
      <div className="profile-row">
        <span className="label">Business-use %</span>
        <span className="value">{sqftPct.toFixed(1)}%</span>
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
        Must be used regularly and exclusively for business
      </div>
    </>
  )
}

function ExpenseRow({
  config,
  state,
  sqftPct,
  onChange,
}: {
  config: ExpenseConfig
  state: ExpenseState
  sqftPct: number
  onChange: (s: ExpenseState) => void
}) {
  const [display, setDisplay] = useState(() => (state.amount > 0 ? formatForDisplay(state.amount) : ''))

  const effectivePct =
    state.pctOverride !== null ? state.pctOverride : config.defaultPctType === 'fixed' ? config.fixedPct : sqftPct

  const [pctDisplay, setPctDisplay] = useState(() => (state.pctOverride !== null ? String(state.pctOverride) : ''))

  return (
    <>
      <div className="profile-row">
        <span className="label">{config.name}</span>
        <input
          type="text"
          inputMode="numeric"
          value={display}
          placeholder="$0"
          onFocus={() => setDisplay(state.amount === 0 ? '' : String(state.amount))}
          onBlur={(e) => {
            const v = parseCurrencyInput(e.target.value)
            const amount = isNaN(v) ? 0 : v
            onChange({ ...state, amount })
            setDisplay(amount > 0 ? formatForDisplay(amount) : '')
          }}
          onChange={(e) => setDisplay(e.target.value)}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: config.helper ? '2px' : '8px',
          fontSize: '11px',
          color: '#888',
        }}
      >
        <span>Business use</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <input
            type="text"
            inputMode="numeric"
            value={pctDisplay}
            placeholder={effectivePct.toFixed(0)}
            style={{
              width: '40px',
              textAlign: 'right',
              fontSize: '11px',
              fontFamily: 'var(--font-mono), monospace',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px dashed #ccc',
              color: '#1a1a1a',
              padding: '1px 0',
              outline: 'none',
              fontWeight: state.pctOverride !== null ? 600 : 400,
            }}
            onFocus={() => setPctDisplay(state.pctOverride !== null ? String(state.pctOverride) : '')}
            onBlur={(e) => {
              const raw = e.target.value.replace(/%/g, '').trim()
              if (raw === '') {
                onChange({ ...state, pctOverride: null })
                setPctDisplay('')
              } else {
                const v = Math.min(100, Math.max(0, parseFloat(raw) || 0))
                onChange({ ...state, pctOverride: v })
                setPctDisplay(String(v))
              }
            }}
            onChange={(e) => setPctDisplay(e.target.value)}
          />
          <span>%</span>
        </span>
      </div>
      {config.helper && (
        <div
          style={{
            fontSize: '10px',
            color: '#999',
            lineHeight: '1.4',
            marginBottom: '8px',
            textAlign: 'right',
          }}
        >
          {config.helper}
        </div>
      )}
    </>
  )
}

export default function HomeOfficeInputs(props: HomeOfficeInputsProps) {
  return (
    <>
      <div className="profile-section">
        <div className="section-label">Your Home Office</div>
        <SqftInputs
          officeSqft={props.officeSqft}
          homeSqft={props.homeSqft}
          sqftPct={props.sqftPct}
          onOfficeSqftChange={props.onOfficeSqftChange}
          onHomeSqftChange={props.onHomeSqftChange}
        />
      </div>
      <div className="profile-section">
        <div className="section-label">Monthly Expenses</div>
        {EXPENSE_CONFIGS.map((config) => (
          <ExpenseRow
            key={config.key}
            config={config}
            state={props.expenses[config.key]}
            sqftPct={props.sqftPct}
            onChange={(s) => props.onExpenseChange(config.key, s)}
          />
        ))}
      </div>
    </>
  )
}
