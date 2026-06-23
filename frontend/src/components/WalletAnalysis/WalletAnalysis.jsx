import React, { useState, useEffect } from 'react'
import { Search, Copy, ExternalLink, Wallet, Eye, EyeOff } from 'lucide-react'
import { useWalletV2 } from '../../hooks/useWalletV2'
import { useWallet } from '../../context/WalletContext'
import { useWatchlist } from '../../hooks/useWatchlist'
import { formatPrice, shortAddress } from '../../utils/format'
import './WalletAnalysis.css'

const EXAMPLE_WALLETS = [
  { label: 'Vitalik',            address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
  { label: 'Binance Hot Wallet', address: '0x28C6c06298d514Db089934071355E5743bf21d60' },
  { label: 'Uniswap V2 Router',  address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' },
]

const CATEGORY_COLORS = {
  cex:    '#A78BFA',
  whale:  '#22D3EE',
  alpha:  '#FBBF24',
  fund:   '#34D399',
}

function timeAgo(ts) {
  if (!ts) return '—'
  const s = Math.floor(Date.now() / 1000 - ts)
  if (s < 60)      return `${s}s ago`
  if (s < 3600)    return `${Math.floor(s / 60)}m ago`
  if (s < 86400)   return `${Math.floor(s / 3600)}h ago`
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {})
}

export default function WalletAnalysis({ initialAddress = null, onInitConsumed }) {
  const [inputVal, setInputVal] = useState('')
  const { data, loading, error, retrying, fetch } = useWalletV2()
  const { address: connectedAddress, isConnected } = useWallet()
  const { isWatching, addWallet, removeWallet, loading: watchLoading, toast: watchToast, contractReady } = useWatchlist()

  // Auto-trigger from Watchlist navigate
  useEffect(() => {
    if (initialAddress) {
      setInputVal(initialAddress)
      fetch(initialAddress)
      onInitConsumed?.()
    }
  }, [initialAddress])

  function handleSubmit() {
    const addr = inputVal.trim()
    if (addr) fetch(addr)
  }

  function handleSample(address) {
    setInputVal(address)
    fetch(address)
  }

  function handleAnalyseMyWallet() {
    if (!connectedAddress) return
    setInputVal(connectedAddress)
    fetch(connectedAddress)
  }

  async function handleWatchToggle() {
    if (!data?.address) return
    if (isWatching(data.address)) {
      await removeWallet(data.address)
    } else {
      await addWallet(data.address)
    }
  }

  const watching = data?.address ? isWatching(data.address) : false

  const entityColor = data?.entity_category
    ? (CATEGORY_COLORS[data.entity_category] || '#A78BFA')
    : null

  return (
    <div>
      {/* ── Search ─────────────────────────────────────────── */}
      <div className="wa-search">
        <input
          className="wa-input"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Paste Ethereum address (0x…)"
        />
        <button className="wa-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing…' : 'Analyze ↗'}
        </button>
      </div>

      {/* ── Analyse My Wallet (connected) ──────────────────── */}
      {isConnected && (
        <button
          className="wa-my-wallet-btn"
          onClick={handleAnalyseMyWallet}
          disabled={loading}
        >
          <Wallet size={13} strokeWidth={1.8} />
          Analyse My Wallet
          <span className="wa-my-wallet-addr">{connectedAddress.slice(0, 6)}…{connectedAddress.slice(-4)}</span>
        </button>
      )}

      {/* ── Error ──────────────────────────────────────────── */}
      {error && (
        <div className="sdk-note sdk-note-error" style={{ marginBottom: '14px' }}>{error}</div>
      )}

      {/* ── Empty state ────────────────────────────────────── */}
      {!data && !loading && !error && (
        <div className="wa-empty">
          <Search className="wa-empty-icon-svg" size={48} strokeWidth={1} />
          <div className="wa-empty-title">Enter a wallet address to begin analysis</div>
          <div className="wa-empty-sub">Live on-chain data via Etherscan · Click any example to try</div>
          <div className="wa-empty-examples">
            {EXAMPLE_WALLETS.map(ex => (
              <button
                key={ex.address}
                className="wa-example-pill"
                onClick={() => handleSample(ex.address)}
              >
                <span className="wa-example-name">{ex.label}</span>
                <span className="wa-example-addr">{shortAddress(ex.address)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Skeleton loader ────────────────────────────────── */}
      {loading && (
        <div>
          {retrying && (
            <div className="wa-retry-notice">
              Backend warming up — this can take 30s on cold start. Retrying…
            </div>
          )}
          <div className="wa-skeleton-profile">
            <div className="skeleton wa-skeleton-avatar" />
            <div className="wa-skeleton-info">
              <div className="skeleton wa-skeleton-name" />
              <div className="skeleton wa-skeleton-type" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '14px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '10px' }} />
            ))}
          </div>
          <div className="skeleton" style={{ height: '180px', borderRadius: '10px', marginBottom: '14px' }} />
          <div className="skeleton" style={{ height: '240px', borderRadius: '10px' }} />
        </div>
      )}

      {/* ── Results ────────────────────────────────────────── */}
      {/* ── Watchlist toast ─────────────────────────────────── */}
      {watchToast && (
        <div className="wa-watch-toast">{watchToast}</div>
      )}

      {data && !loading && (
        <>
          {/* Section A — Identity header */}
          {(data.entity_label || data.ens_name) && (
            <div
              className="wa-identity-banner"
              style={{ borderColor: entityColor + '44', background: entityColor + '12' }}
            >
              <div className="wa-identity-label" style={{ color: entityColor || 'var(--accent)' }}>
                {data.entity_label
                  ? `Identified as: ${data.entity_label}`
                  : data.ens_name}
              </div>
              {data.entity_notes && (
                <div className="wa-identity-notes">{data.entity_notes}</div>
              )}
              {data.ens_name && data.entity_label && (
                <div className="wa-identity-notes">{data.ens_name}</div>
              )}
              <div className="wa-identity-addr">
                <code>{shortAddress(data.address)}</code>
                <button
                  className="wa-copy-btn"
                  onClick={() => copyToClipboard(data.address)}
                  aria-label="Copy address"
                >
                  <Copy size={11} />
                </button>
              </div>
            </div>
          )}

          {/* If no identity, show a plain address header */}
          {!data.entity_label && !data.ens_name && (
            <div className="wa-addr-header">
              <code className="wa-addr-code">{shortAddress(data.address)}</code>
              <button
                className="wa-copy-btn"
                onClick={() => copyToClipboard(data.address)}
                aria-label="Copy address"
              >
                <Copy size={11} />
              </button>
            </div>
          )}

          {/* Watch this Wallet button */}
          {isConnected && contractReady && (
            <button
              className={`wa-watch-btn ${watching ? 'wa-watch-btn--watching' : ''}`}
              onClick={handleWatchToggle}
              disabled={watchLoading}
            >
              {watching
                ? <><EyeOff size={13} strokeWidth={1.8} /> Watching — click to remove</>
                : <><Eye    size={13} strokeWidth={1.8} /> Watch this Wallet</>
              }
            </button>
          )}

          {/* Section B — Metrics strip */}
          <div className="wa-metrics-strip">
            <div className="wa-metric-card">
              <div className="card-title">ETH Balance</div>
              <div className="metric-value accent">
                {data.eth_balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                <span className="wa-metric-unit"> ETH</span>
              </div>
            </div>
            <div className="wa-metric-card">
              <div className="card-title">ETH Value</div>
              <div className="metric-value">{formatPrice(data.eth_value_usd)}</div>
            </div>
            <div className="wa-metric-card">
              <div className="card-title">Total Portfolio</div>
              <div className="metric-value accent">{formatPrice(data.total_value_usd)}</div>
            </div>
          </div>

          {/* Section C — ERC20 token holdings */}
          <div className="wa-card" style={{ marginBottom: '14px' }}>
            <div className="card-title">
              ERC-20 Holdings
              <span className="pill pill-sdk" style={{ fontSize: '9px', padding: '2px 5px' }}>
                Etherscan live
              </span>
            </div>
            {data.erc20_holdings.length === 0 ? (
              <div className="wa-empty-row">No token holdings detected</div>
            ) : (
              <table className="wa-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th style={{ textAlign: 'right' }}>Balance</th>
                    <th style={{ textAlign: 'right' }}>USD Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.erc20_holdings.map(h => (
                    <tr key={h.symbol}>
                      <td className="wa-token-sym">{h.symbol}</td>
                      <td style={{ textAlign: 'right', color: 'rgba(255,255,255,0.65)' }}>
                        {h.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {h.value_usd > 0 ? formatPrice(h.value_usd) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Section D — Recent transactions */}
          <div className="wa-card" style={{ marginBottom: '14px' }}>
            <div className="card-title">
              Recent Transactions
              <span className="pill pill-live" style={{ fontSize: '9px', padding: '2px 5px' }}>
                <span className="dot-pulse" />
              </span>
            </div>
            {data.recent_transactions.length === 0 ? (
              <div className="wa-empty-row">No transactions found</div>
            ) : (
              <table className="wa-table wa-tx-table">
                <thead>
                  <tr>
                    <th>Hash</th>
                    <th>From → To</th>
                    <th style={{ textAlign: 'right' }}>Value</th>
                    <th style={{ textAlign: 'right' }}>Time</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_transactions.map(tx => (
                    <tr
                      key={tx.hash}
                      className={tx.is_error ? 'wa-tx-failed' : ''}
                    >
                      <td>
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="wa-tx-hash"
                        >
                          {shortAddress(tx.hash)}
                          <ExternalLink size={9} style={{ marginLeft: '3px', opacity: 0.5 }} />
                        </a>
                      </td>
                      <td className="wa-tx-flow">
                        <span className="wa-tx-addr">{shortAddress(tx.from)}</span>
                        <span className="wa-tx-arrow">→</span>
                        <span className="wa-tx-addr">{tx.to ? shortAddress(tx.to) : '—'}</span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {tx.value_eth > 0 ? (
                          <>
                            <span style={{ color: 'var(--accent)' }}>
                              {tx.value_eth.toFixed(4)} ETH
                            </span>
                            {tx.value_usd > 0 && (
                              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                                {formatPrice(tx.value_usd)}
                              </div>
                            )}
                          </>
                        ) : '—'}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {timeAgo(tx.timestamp)}
                      </td>
                      <td className="wa-tx-method">{tx.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Section E — Metadata footer */}
          <div className="wa-footer">
            <div className="wa-footer-row">
              {data.total_txs != null && (
                <span>Transactions sent: <strong>{data.total_txs.toLocaleString()}</strong></span>
              )}
              {data.first_tx_timestamp && (
                <span>First tx: <strong>{formatDate(data.first_tx_timestamp)}</strong></span>
              )}
              {data.last_tx_timestamp && (
                <span>Last activity: <strong>{timeAgo(data.last_tx_timestamp)}</strong></span>
              )}
            </div>
            <div className="wa-footer-links">
              <span className="wa-footer-source">Data via Etherscan · refreshed every 60s</span>
              <a
                href={`https://etherscan.io/address/${data.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="wa-etherscan-link"
              >
                <ExternalLink size={11} /> Open in Etherscan
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
