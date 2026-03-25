import React from 'react';

export default function IncomingCallModal({ callerName, callType, onAccept, onDecline }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99998, animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: '#1c1c1c', borderRadius: '24px', padding: '40px 48px',
        textAlign: 'center', minWidth: '320px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        animation: 'slideUp 0.4s ease'
      }}>
        {/* Animated Ring */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: callType === 'video' ? '#7c3aed' : '#22c55e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', animation: 'pulse 1.5s infinite',
          boxShadow: callType === 'video'
            ? '0 0 0 0 rgba(124,58,237,0.4)'
            : '0 0 0 0 rgba(34,197,94,0.4)'
        }}>
          {callType === 'video' ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          )}
        </div>

        <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 600, marginBottom: '6px' }}>
          {callerName || 'Someone'}
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '32px' }}>
          Incoming {callType === 'video' ? 'Video' : 'Voice'} Call…
        </p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button
            onClick={onDecline}
            style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#ef4444', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.15s', boxShadow: '0 4px 16px rgba(239,68,68,0.4)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Decline"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <button
            onClick={onAccept}
            style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#22c55e', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.15s', boxShadow: '0 4px 16px rgba(34,197,94,0.4)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Accept"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          70% { box-shadow: 0 0 0 20px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
