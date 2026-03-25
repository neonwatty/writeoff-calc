'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

function ReceiptSkeleton() {
  return (
    <div className="receipt" style={{ minHeight: '600px' }}>
      <div className="receipt-header">
        <h1>Your Tax Profile</h1>
        <div className="subtitle" style={{ color: '#ccc' }}>
          Loading...
        </div>
      </div>
      <div style={{ padding: '20px 0' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: '16px',
              background: '#eee',
              borderRadius: '3px',
              marginBottom: '12px',
              width: `${70 + (i % 3) * 10}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

const ProfilePage = dynamic(() => import('@/components/ProfilePage'), {
  ssr: false,
  loading: () => <ReceiptSkeleton />,
})

export default function ProfilePageLoader() {
  return (
    <ErrorBoundary>
      <ProfilePage />
    </ErrorBoundary>
  )
}
