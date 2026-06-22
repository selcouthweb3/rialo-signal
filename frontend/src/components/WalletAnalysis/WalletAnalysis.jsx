import React, { useState } from 'react'
import { fetchWalletAnalysis } from '../../services/api'
import { formatPrice, formatCompact, formatChange, changeClass, shortAddress } from '../../utils/format'
import './WalletAnalysis.css'

const SAMPLE_WALLETS = [
  { label: 'Whale',       address: '0x3f8ad91c4422b9e1' },
  { label: 'Smart money', address: '0x91fcaa37bb2d9901' },
  { label: 'Exchange',    address: '0xb72e440155de8812' },
  { label: 'Retail',      address: '0xa1b2c3d4e5f60007' },
]

const TYPE_COLORS = {
  mega_whale: '#F87171',
  exchange:   '#FBBF24',
  smart:      '#A78BFA',
  vc:         '#38bdf8',
  retail:     '#34D399',
  bot:        '#888780',
}

const TYPE_INITIALS = {
  mega_whale: 'MW', exchange: 'EX', smart: 'SM',
  vc: 'VC', retail: 'RT', bot: 'BT',
}

export default function WalletAnalysis() {
  const [inputVal, setInputVal] = useState('')
  const [wallet, setWallet]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  async function analyze(address) {
    if (!address || address.length < 6) return
    setLoading(true); setError(null)
    try {
      const data = await fetchWalletAnalysis(address)
      setWallet(data)
    } catch {
      setError('Could not analyze wallet. Try a different address.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit() { analyze(inputVal.trim() || '0x3f8ad91c4422b9e1') }
  function handleSample(address) { setInputVal(address); analyze(address) }

  const cls      = wallet?.classification ?? {}
  const color    = TYPE_COLORS[cls.type]  ?? '#888780'
  const initials = TYPE_INITIALS[cls.type] ?? '?'
  const bScore   = wallet?.behaviour?.score ?? 0
  const bLabel   = wallet?.behaviour?.behaviour ?? '—'
  const rwa      = wallet?.rwa_exposure ?? {}
  const sm       = wallet?.smart_money_correlation ?? {}
  const bColor   = bScore >= 65 ? 'var(--accent)' : bScore >= 40 ? 'var(--warn)' : 'var(--danger)'

  return (
    <div>
      {/* Search */}
      <div className="wa-search">
        <input
          className="wa-input"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Paste wallet address (e.g. 0x3f8a...d91c)"
        />
        <button className="wa-btn" onClick={handleSubmit}>
          {loading ? 'Analyzing...' : 'Analyze ↗'}
        </button>
      </div>

      {/* Sample wallets */}
      <div className="wa-sample-row">
        <span className="wa-sample-label">Try sample:</span>
        {SAMPLE_WALLETS.map(s => (
          <button key={s.address} className="wa-sample-btn" onClick={() => handleSample(s.address)}>
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="sdk-note sdk-note-error" style={{marginBottom:'14px'}}>{error}</div>
      )}

      {!wallet && !loading && !error && (
        <div className="wa-empty">
          <div className="wa-empty-icon">◈</div>
          <div className="wa-empty-title">Enter a wallet address to begin analysis</div>
          <div className="wa-empty-sub">Or click a sample wallet above</div>
        </div>
      )}

      {loading && (
        <div className="wa-loading">Scanning wallet onchain...</div>
      )}

      {wallet && !loading && (
        <>
          {/* Profile row */}
          <div className="wa-profile">
            <div
              className="wa-avatar"
              style={{background: color + '22', border: `1.5px solid ${color}`, color}}
            >
              {initials}
            </div>
            <div className="wa-profile-info">
              <div className="wa-address">{shortAddress(wallet.address)}</div>
              <div className="wa-type">
                <span style={{color}}>{cls.label}</span>
                {cls.known && (
                  <span className="pill pill-live" style={{fontSize:'9px',padding:'1px 6px',marginLeft:'8px'}}>
                    Known wallet
                  </span>
                )}
                {cls.smart_money && (
                  <span className="pill pill-sdk" style={{fontSize:'9px',padding:'1px 6px',marginLeft:'4px'}}>
                    Smart money
                  </span>
                )}
              </div>
              {sm.correlation > 0.5 && (
                <div className="wa-sm-note">
                  Leads price by ~{sm.lead_time_hours}h · Correlation: {(sm.correlation*100).toFixed(0)}%
                </div>
              )}
            </div>
            <div className="wa-behaviour-score">
              <div className="wa-bscore-val" style={{color: bColor}}>{Math.round(bScore)}</div>
              <div className="wa-bscore-lbl">{bLabel}</div>
              <div className="wa-bscore-sub">Behaviour score</div>
            </div>
            <span className={`scam-badge ${wallet.scam_risk === 'Low' ? 'scam-safe' : 'scam-danger'}`}>
              {wallet.scam_risk === 'Low' ? 'Clean' : 'Risk detected'}
            </span>
          </div>

          {/* Holdings + Activity */}
          <div className="wa-grid">
            <div className="wa-card">
              <div className="card-title">
                Token Holdings
                <span className="pill pill-sdk" style={{fontSize:'9px',padding:'2px 5px'}}>Rialo Read Path</span>
              </div>
              {(wallet.holdings ?? []).map((h, i) => (
                <div className="holding-row" key={i}>
                  <div className="holding-sym">{h.token}</div>
                  <div className="holding-val">{formatPrice(h.value_usd)}</div>
                  {h.rwa_correlated && <span className="cyan" style={{fontSize:'9px',marginRight:'4px'}}>RWA</span>}
                  <div className={`holding-chg ${changeClass(h.pct_24h)}`}>{formatChange(h.pct_24h)}</div>
                </div>
              ))}
              <div className="holding-total">
                <span className="holding-total-label">Total value</span>
                <span className="holding-total-val">{formatPrice(rwa.total_value_usd ?? 0)}</span>
              </div>
            </div>

            <div className="wa-card">
              <div className="card-title">
                Onchain Activity
                <span className="pill pill-live" style={{fontSize:'9px',padding:'2px 5px'}}>
                  <span className="dot-pulse"></span>
                </span>
              </div>
              {(wallet.recent_activity ?? []).slice(0, 6).map((act, i) => (
                <div className="act-row" key={i}>
                  <span className={`act-badge act-${act.type === 'LIQ+' ? 'liq-positive' : act.type}`}>
                    {act.type}
                  </span>
                  <span className="act-desc">{act.token} · {act.hash}</span>
                  <span className="act-val">{formatPrice(act.value_usd)}</span>
                  <span className="act-time">{act.time_ago}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RWA exposure + Predicates */}
          <div className="wa-grid">
            <div className="wa-card">
              <div className="card-title">
                RWA Exposure
                <span className="pill pill-sdk" style={{fontSize:'9px',padding:'2px 5px'}}>Rialo Signal unique</span>
              </div>
              <div className="exp-desc">Portfolio split across asset classes</div>
              {[
                {label:'RWA-correlated', pct: rwa.rwa_correlated_pct ?? 0, color:'var(--accent)'},
                {label:'Pure crypto',    pct: rwa.crypto_pct ?? 0,          color:'var(--accent2)'},
                {label:'Stablecoins',    pct: rwa.stablecoin_pct ?? 0,      color:'var(--warn)'},
              ].map(row => (
                <div className="exposure-row" key={row.label}>
                  <span className="exp-label">{row.label}</span>
                  <div className="exp-track">
                    <div className="exp-fill" style={{width:`${row.pct}%`, background: row.color}} />
                  </div>
                  <span className="exp-val" style={{color: row.color}}>{row.pct.toFixed(1)}%</span>
                </div>
              ))}
              <div className="sdk-note sdk-note-mt">
                On mainnet: Rialo Read Path delivers live portfolio state from validators.
              </div>
            </div>

            <div className="wa-card">
              <div className="card-title">
                Rialo Predicates
                <span className="pill pill-sdk" style={{fontSize:'9px',padding:'2px 5px'}}>SDK Ready</span>
              </div>
              <div className="pred-desc">Fire automatically onchain — no bot needed</div>
              {(wallet.rialo_predicates ?? []).map((p, i) => (
                <div className="pred-row" key={i}>
                  <div className="pred-condition">If: {p.predicate}</div>
                  <div className="pred-action">→ {p.action}</div>
                </div>
              ))}
              <div className="sdk-note sdk-note-mt">
                On mainnet: predicates evaluate inside every block. Zero external scheduler.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
