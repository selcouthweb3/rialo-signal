import React from 'react'
import { Eye, Search, Trash2 } from 'lucide-react'
import { useWatchlist } from '../../hooks/useWatchlist'
import './Watchlist.css'

function truncAddr(addr) {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function Watchlist({ onAnalyse }) {
  const { watchlist, loading, error, toast, removeWallet, contractReady } = useWatchlist()

  if (!contractReady) {
    return (
      <div className="wl-empty">
        <Eye className="wl-empty-icon" size={48} strokeWidth={1} />
        <div className="wl-empty-title">Watchlist not yet deployed</div>
        <div className="wl-empty-sub">
          Deploy WalletRegistry to Sepolia and set VITE_REGISTRY_CONTRACT to enable onchain watchlist
        </div>
      </div>
    )
  }

  return (
    <div className="wl-root">
      {toast && <div className="wl-toast">{toast}</div>}
      {error && <div className="sdk-note sdk-note-error">{error}</div>}

      {loading && watchlist.length === 0 && (
        <div className="wl-loading">Loading watchlist from contract…</div>
      )}

      {!loading && watchlist.length === 0 && (
        <div className="wl-empty">
          <Eye className="wl-empty-icon" size={48} strokeWidth={1} />
          <div className="wl-empty-title">No wallets watched yet</div>
          <div className="wl-empty-sub">
            Analyse a wallet and click "Watch this Wallet" to add it to your onchain watchlist
          </div>
        </div>
      )}

      {watchlist.length > 0 && (
        <div className="wl-list">
          <div className="card-title">
            Onchain Watchlist
            <span className="pill pill-sdk" style={{ fontSize: '9px', padding: '2px 6px' }}>
              {watchlist.length} wallet{watchlist.length !== 1 ? 's' : ''}
            </span>
          </div>

          {watchlist.map(addr => (
            <div key={addr} className="wl-row">
              <span className="wl-addr">{truncAddr(addr)}</span>
              <div className="wl-row-actions">
                <button
                  className="wl-analyse-btn"
                  onClick={() => onAnalyse(addr)}
                  title="Analyse this wallet"
                >
                  <Search size={12} strokeWidth={1.8} />
                  Analyse
                </button>
                <button
                  className="wl-remove-btn"
                  onClick={() => removeWallet(addr)}
                  disabled={loading}
                  title="Remove from watchlist"
                  aria-label="Remove wallet"
                >
                  <Trash2 size={12} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
