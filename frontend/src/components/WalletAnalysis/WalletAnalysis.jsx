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
  mega_whale: '#ef4444', exchange: '#f59e0b', smart: '#7B6EF6',
  vc: '#38bdf8', retail: '#00e5b4', bot: '#888780',
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
  const color    = TYPE_COLORS[cls.type] ?? '#888780'
  const initials = TYPE_INITIALS[cls.type] ?? '?'
  const bScore   = wallet?.behaviour?.score ?? 0
  const bLabel   = wallet?.behaviour?.behaviour ?? '—'
  const rwa      = wallet?.rwa_exposure ?? {}
  const sm       = wallet?.smart_money_correlation ?? {}

  return (
    <div>
      <div className="wa-search">
        <input className="wa-input" value={inputVal} onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Paste wallet address (e.g. 0x3f8a...d91c)" />
        <button className="wa-btn" onClick={handleSubmit}>{loading ? 'Analyzing...' : 'Analyze ↗'}</button>
      </div>

      <div style={{display:'flex',gap:'6px',marginBottom:'16px',flexWrap:'wrap'}}>
        <span style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',alignSelf:'center'}}>Try sample:</span>
        {SAMPLE_WALLETS.map(s => (
          <button key={s.address} className="wa-sample-btn" onClick={() => handleSample(s.address)}>{s.label}</button>
        ))}
      </div>

      {error && (
        <div className="sdk-note" style={{color:'#ef4444',borderColor:'rgba(239,68,68,0.25)',background:'rgba(239,68,68,0.06)',marginBottom:'14px'}}>{error}</div>
      )}

      {!wallet && !loading && !error && (
        <div style={{textAlign:'center',padding:'60px 20px',color:'rgba(255,255,255,0.25)'}}>
          <div style={{fontSize:'32px',marginBottom:'12px'}}>◈</div>
          <div style={{fontSize:'13px',marginBottom:'8px',color:'rgba(255,255,255,0.45)'}}>Enter a wallet address to begin analysis</div>
          <div style={{fontSize:'11px'}}>Or click a sample wallet above</div>
        </div>
      )}

      {loading && (
        <div style={{textAlign:'center',padding:'60px 20px',color:'rgba(255,255,255,0.35)'}}>
          <div style={{fontSize:'12px'}}>Scanning wallet onchain...</div>
        </div>
      )}

      {wallet && !loading && (
        <>
          <div className="wa-profile">
            <div className="wa-avatar" style={{background:color+'22',border:`1.5px solid ${color}`,color}}>{initials}</div>
            <div className="wa-profile-info">
              <div className="wa-address">{shortAddress(wallet.address)}</div>
              <div className="wa-type">
                <span style={{color}}>{cls.label}</span>
                {cls.known && <span className="pill pill-live" style={{fontSize:'9px',padding:'1px 6px',marginLeft:'8px'}}>Known wallet</span>}
                {cls.smart_money && <span className="pill pill-sdk" style={{fontSize:'9px',padding:'1px 6px',marginLeft:'4px'}}>Smart money</span>}
              </div>
              {sm.correlation > 0.5 && (
                <div style={{marginTop:'6px',fontSize:'11px',color:'rgba(255,255,255,0.45)'}}>
                  Leads price by ~{sm.lead_time_hours}h · Correlation: {(sm.correlation*100).toFixed(0)}%
                </div>
              )}
            </div>
            <div className="wa-behaviour-score">
              <div className="wa-bscore-val" style={{color:bScore>=65?'#00e5b4':bScore>=40?'#f59e0b':'#ef4444'}}>{Math.round(bScore)}</div>
              <div className="wa-bscore-lbl">{bLabel}</div>
              <div style={{fontSize:'9px',color:'rgba(255,255,255,0.25)',marginTop:'2px'}}>Behaviour score</div>
            </div>
            <span className={`scam-badge ${wallet.scam_risk==='Low'?'scam-safe':'scam-danger'}`} style={{fontSize:'9px'}}>
              {wallet.scam_risk==='Low'?'Clean':'Risk detected'}
            </span>
          </div>

          <div className="wa-grid">
            <div className="wa-card">
              <div className="wa-card-title">Token Holdings <span className="pill pill-sdk" style={{fontSize:'9px',padding:'2px 5px'}}>Rialo Read Path</span></div>
              {(wallet.holdings ?? []).map((h,i) => (
                <div className="holding-row" key={i}>
                  <div className="holding-sym">{h.token}</div>
                  <div className="holding-val">{formatPrice(h.value_usd)}</div>
                  {h.rwa_correlated && <span style={{fontSize:'9px',color:'#00e5b4',marginRight:'4px'}}>RWA</span>}
                  <div className={`holding-chg ${changeClass(h.pct_24h)}`}>{formatChange(h.pct_24h)}</div>
                </div>
              ))}
              <div style={{marginTop:'10px',paddingTop:'8px',borderTop:'0.5px solid rgba(255,255,255,0.06)',fontSize:'12px',display:'flex',justifyContent:'space-between'}}>
                <span style={{color:'rgba(255,255,255,0.45)'}}>Total value</span>
                <span className="up" style={{fontFamily:'Syne,sans-serif',fontWeight:600}}>{formatPrice(rwa.total_value_usd??0)}</span>
              </div>
            </div>

            <div className="wa-card">
              <div className="wa-card-title">Onchain Activity <span className="pill pill-live" style={{fontSize:'9px',padding:'2px 5px'}}><span className="dot-pulse"></span></span></div>
              {(wallet.recent_activity ?? []).slice(0,6).map((act,i) => (
                <div className="act-row" key={i}>
                  <span className={`act-badge act-${act.type}`}>{act.type}</span>
                  <span className="act-desc">{act.token} · {act.hash}</span>
                  <span className="act-val">{formatPrice(act.value_usd)}</span>
                  <span className="act-time">{act.time_ago}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="wa-grid">
            <div className="wa-card">
              <div className="wa-card-title">RWA Exposure <span className="pill pill-sdk" style={{fontSize:'9px',padding:'2px 5px'}}>Rialo Signal unique</span></div>
              <div style={{marginBottom:'12px',fontSize:'11px',color:'rgba(255,255,255,0.40)'}}>Portfolio split across asset classes</div>
              {[
                {label:'RWA-correlated', pct:rwa.rwa_correlated_pct??0, color:'#00e5b4'},
                {label:'Pure crypto',    pct:rwa.crypto_pct??0,          color:'#7B6EF6'},
                {label:'Stablecoins',    pct:rwa.stablecoin_pct??0,      color:'#f59e0b'},
              ].map(row => (
                <div className="exposure-row" key={row.label}>
                  <span className="exp-label">{row.label}</span>
                  <div className="exp-track"><div className="exp-fill" style={{width:`${row.pct}%`,background:row.color}}/></div>
                  <span className="exp-val" style={{color:row.color}}>{row.pct.toFixed(1)}%</span>
                </div>
              ))}
              <div className="sdk-note" style={{marginTop:'12px'}}>🔵 On mainnet: Rialo Read Path delivers live portfolio state from validators.</div>
            </div>

            <div className="wa-card">
              <div className="wa-card-title">Rialo Predicates <span className="pill pill-sdk" style={{fontSize:'9px',padding:'2px 5px'}}>SDK Ready</span></div>
              <div style={{marginBottom:'10px',fontSize:'11px',color:'rgba(255,255,255,0.40)'}}>Fire automatically onchain — no bot needed</div>
              {(wallet.rialo_predicates ?? []).map((p,i) => (
                <div className="pred-row" key={i}>
                  <div className="pred-condition">If: {p.predicate}</div>
                  <div className="pred-action">→ {p.action}</div>
                </div>
              ))}
              <div className="sdk-note" style={{marginTop:'10px'}}>🔵 On mainnet: predicates evaluate inside every block. Zero external scheduler.</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
