import React from 'react'

export function LoadingCard() {
  return (
    <div className="card">
      <div className="d-flex align-items-center p-3 overflow-hidden justify-content-between" style={{ height: '80px', backgroundColor: 'var(--body-bg)' }}>
        <div className="skeleton-badge" style={{
          width: '60px',
          height: '30px',
          borderRadius: '50px',
          backgroundColor: 'var(--secondary)',
          opacity: 0.3,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}></div>
        <div className="skeleton-image" style={{
          height: '150px',
          width: '150px',
          backgroundColor: 'var(--secondary)',
          opacity: 0.3,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}></div>
      </div>
      <div className="p-3" style={{ fontSize: '1rem', zIndex: 1 }}>
        <div className="skeleton-title mb-2" style={{
          height: '20px',
          backgroundColor: 'var(--secondary)',
          opacity: 0.3,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}></div>
        <div className="skeleton-description mb-3" style={{
          height: '40px',
          backgroundColor: 'var(--secondary)',
          opacity: 0.3,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}></div>
        <div className="skeleton-button" style={{
          height: '32px',
          backgroundColor: 'var(--secondary)',
          opacity: 0.3,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}></div>
      </div>
    </div>
  )
}