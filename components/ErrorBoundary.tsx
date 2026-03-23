"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="receipt" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            Something went wrong
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
            Try refreshing the page. Your saved profile will be restored.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '12px',
              padding: '8px 20px',
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            REFRESH
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
