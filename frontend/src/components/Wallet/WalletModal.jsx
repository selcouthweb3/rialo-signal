import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useWallet } from '../../context/WalletContext'
import './WalletModal.css'

const hasMetaMask = typeof window !== 'undefined' && Boolean(window.ethereum)

export default function WalletModal({ open, onClose }) {
  const { connect, connecting, error, setError } = useWallet()
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Clear error when modal opens
  useEffect(() => {
    if (open) setError(null)
  }, [open, setError])

  if (!open) return null

  async function handleMetaMask() {
    try {
      await connect()
      onClose()
    } catch {
      // error state is set inside connect()
    }
  }

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div className="wm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="wm-card" role="dialog" aria-modal="true" aria-label="Connect Wallet">

        {/* Header */}
        <div className="wm-header">
          <span className="wm-title">Connect Wallet</span>
          <button className="wm-close" onClick={onClose} aria-label="Close modal">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="wm-error">{error}</div>
        )}

        {/* Wallet options */}
        <div className="wm-options">

          {/* MetaMask */}
          <button
            className={`wm-option${!hasMetaMask ? ' wm-option--dim' : ''}${connecting ? ' wm-option--loading' : ''}`}
            onClick={handleMetaMask}
            disabled={connecting || !hasMetaMask}
          >
            <span className="wm-icon wm-icon--mm">🦊</span>
            <span className="wm-option-info">
              <span className="wm-option-name">MetaMask</span>
              {hasMetaMask && <span className="wm-option-sub">Browser extension</span>}
            </span>
            <span className={`wm-badge ${hasMetaMask ? 'wm-badge--teal' : 'wm-badge--muted'}`}>
              {hasMetaMask ? 'Detected' : 'Not Installed'}
            </span>
            {connecting && <span className="wm-spinner" />}
          </button>

          {/* WalletConnect */}
          <div className="wm-option wm-option--dim wm-option--disabled" aria-disabled="true">
            <span className="wm-icon wm-icon--wc">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#3B99FC" fillOpacity="0.15"/>
                <path d="M9 12c3.87-3.79 10.13-3.79 14 0l.47.46a.48.48 0 010 .68l-1.6 1.57a.25.25 0 01-.35 0l-.64-.63a7.07 7.07 0 00-9.76 0l-.69.67a.25.25 0 01-.35 0L8.49 13.2a.48.48 0 010-.68L9 12zm17.28 3.22l1.43 1.4a.48.48 0 010 .68l-6.43 6.3a.5.5 0 01-.7 0l-4.56-4.47a.12.12 0 00-.17 0l-4.56 4.47a.5.5 0 01-.7 0L4.29 17.3a.48.48 0 010-.68l1.43-1.4a.5.5 0 01.7 0l4.56 4.47a.12.12 0 00.17 0l4.56-4.47a.5.5 0 01.7 0l4.56 4.47a.12.12 0 00.17 0l4.56-4.47a.5.5 0 01.58-.03z" fill="#3B99FC"/>
              </svg>
            </span>
            <span className="wm-option-info">
              <span className="wm-option-name">WalletConnect</span>
              <span className="wm-option-sub">QR code or mobile</span>
            </span>
            <span className="wm-badge wm-badge--amber">Coming Soon</span>
          </div>

          {/* Coinbase Wallet */}
          <div className="wm-option wm-option--dim wm-option--disabled" aria-disabled="true">
            <span className="wm-icon wm-icon--cb">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#0052FF" fillOpacity="0.15"/>
                <rect x="6" y="6" width="20" height="20" rx="10" fill="#0052FF" fillOpacity="0.25"/>
                <rect x="11" y="11" width="10" height="10" rx="5" fill="#0052FF" fillOpacity="0.7"/>
              </svg>
            </span>
            <span className="wm-option-info">
              <span className="wm-option-name">Coinbase Wallet</span>
              <span className="wm-option-sub">Coinbase extension or app</span>
            </span>
            <span className="wm-badge wm-badge--amber">Coming Soon</span>
          </div>

        </div>

        <div className="wm-footer">
          By connecting, you agree to Rialo Signal's terms of service. No transactions will be made without your explicit approval.
        </div>

      </div>
    </div>
  )
}
