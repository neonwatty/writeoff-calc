'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Home', href: '/calculators' },
  { label: 'Write-Off', href: '/calculators/write-off' },
  { label: 'Home Office', href: '/calculators/home-office' },
  { label: 'Quarterly', href: '/calculators/quarterly-estimates' },
  { label: 'Profile', href: '/calculators/profile' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="nav-bar">
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href} className={`nav-item${pathname === tab.href ? ' active' : ''}`}>
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
