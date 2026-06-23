import React, { useState, useEffect, useRef } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { useStaking } from '../../hooks/useStaking'
import './StakingModal.css'

export default function StakingModal({ open, onClose }) {
  const { stakeEth, isPremium, loading, error, stake, unstake } = useStaking()
  const [amount, setAmount] = useState('0.001')
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  async function handleStake() {
    const val = parseFloat(amount)
    if (isNaN(val) || val < 0.001) return
    try {
      await stake(val)
      onClose()
    } catch { /* error shown in hook */ }
  }

  async function handleUnstake() {
    try {
      await unstake()
      onClose()
    } catch { /* error shown in hook */ }
  }

  return (
    <div
      className="sm-overlay"
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="sm-card" role="dialog" aria-modal="true">

        <div className="sm-header">
          <div className="sm-header-info">
            <div className="sm-title">Stake to Unlock Premium</div>
            <div className="sm-subtitle">Sepolia testnet · No real value</div>
          </div>
          <button className="sm-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {error && <div className="sm-error">{error}</div>}

        <div className="sm-body">
          <div className="sm-stat-row">
            <span className="sm-stat-label">Minimum stake</span>
            <span className="sm-stat-val accent2">0.001 ETH</span>
          </div>
          <div className="sm-stat-row">
            <span className="sm-stat-label">Your current stake</span>
            <span className="sm-stat-val">{stakeEth.toFixed(4)} ETH</span>
          </div>
          <div className="sm-stat-row">
            <span className="sm-stat-label">Status</span>
            <span className={`sm-badge ${isPremium ? 'sm-badge--premium' : 'sm-badge--free'}`}>
              {isPremium ? '★ Premium' : 'Free Tier'}
            </span>
          </div>

          <div className="sm-input-row">
            <label className="sm-label">Amount to stake (ETH)</label>
            <input
              className="sm-input"
              type="number"
              min="0.001"
              step="0.001"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            className="sm-btn sm-btn--primary"
            onClick={handleStake}
            disabled={loading || parseFloat(amount) < 0.001}
          >
            {loading ? <span className="sm-spinner" /> : null}
            {loading ? 'Confirming…' : 'Stake ETH'}
          </button>

          {isPremium && (
            <button
              className="sm-btn sm-btn--danger"
              onClick={handleUnstake}
              disabled={loading}
            >
              {loading ? 'Confirming…' : 'Unstake & Return to Free'}
            </button>
          )}
        </div>

        <div className="sm-footer">
          ⚠ Sepolia testnet only. Get free test ETH at{' '}
          <a
            href="https://sepoliafaucet.com"
            target="_blank"
            rel="noopener noreferrer"
            className="sm-faucet-link"
          >
            sepoliafaucet.com <ExternalLink size={10} />
          </a>
        </div>

      </div>
    </div>
  )
}
