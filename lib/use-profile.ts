'use client'

import { useState, useEffect } from 'react'
import type { TaxProfile } from '@/lib/tax-engine'

const STORAGE_KEY = 'writeoff-calc-profile'

const DEFAULT_PROFILE: TaxProfile = {
  w2Income: 50_000,
  llcNetIncome: 25_000,
  filingStatus: 'single',
  taxYear: 2025,
  state: 'Arizona',
}

function loadProfile(): TaxProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_PROFILE
    const parsed = JSON.parse(stored)
    if (
      typeof parsed.w2Income === 'number' &&
      typeof parsed.llcNetIncome === 'number' &&
      ['single', 'mfj', 'mfs', 'hoh'].includes(parsed.filingStatus) &&
      [2025, 2026].includes(parsed.taxYear) &&
      typeof parsed.state === 'string'
    ) {
      return parsed as TaxProfile
    }
    return DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<TaxProfile>(DEFAULT_PROFILE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setProfile(loadProfile())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // ignore write errors
    }
  }, [profile, mounted])

  return { profile, setProfile, mounted }
}
