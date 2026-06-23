import React, { useState, useEffect, useRef } from 'react'
import { usePrices } from '../../hooks/usePrices'
import { useSignals } from '../../hooks/useSignals'
import { useStaking } from '../../hooks/useStaking'
import { useWallet } from '../../context/WalletContext'
import { formatPrice, formatChange, changeClass, signalColor, signalClass, riskColor } from '../../utils/format'
import PipelineFlow from './PipelineFlow'
import StakingModal from '../Wallet/StakingModal'
import './SignalDashboard.css'

const SIGNAL_LABELS = {
  volatility_regime:     'Volatility Regime',
  rwa_crypto_divergence: 'RWA / Crypto Spread',
  momentum:              'Momentum Score',
  liquidity_score:       'Liquidity Depth',
  yield_divergence:      'Yield Divergence',
}

const INITIAL_TX_LOG = [
  { type: 'fired',   desc: 'Rebalance trigger: BTC vol spike',       time: '12s ago' },
  { type: 'fired',   desc: 'RWA spread alert fired → hedge signal',  time: '1m ago'  },
  { type: 'fired',   desc: 'Gold correlation shift detected',        time: '3m ago'  },
  { type: 'pending', desc: 'Bond yield predicate: watching',         time: 'pending' },
  { type: 'sdk',     desc: 'SfS yield routing (Rialo SDK)',          time: 'ready'   },
]

export default function SignalDashboard() {
  const { prices } = usePrices()
  const { signals: signalData } = useSignals()
  const { isConnected, isOnSepolia, switchToSepolia } = useWallet()
  const { isPremium, stakeEth, loading: stakeLoading, toast: stakeTx } = useStaking()
  const [txLog, setTxLog] = useState(INITIAL_TX_LOG)
  const txCountRef = useRef(3)
  const [stakingOpen, setStakingOpen]   = useState(false)

  useEffect(() => {
    if (!signalData?.signals) return
    const spread = signalData.signals.rwa_crypto_divergence
    const vol    = signalData.signals.volatility_regime
    if (spread > 0.80) {
      txCountRef.current += 1
      setTxLog(prev => [
        { type: 'fired', desc: 'Auto: spread threshold crossed → predicate fired', time: 'just now' },
        ...prev.slice(0, 5)
      ])
    } else if (vol > 0.72) {
      setTxLog(prev => [
        { type: 'fired', desc: 'Auto: volatility spike detected', time: 'just now' },
        ...prev.slice(0, 5)
      ])
    }
  }, [signalData?.signals?.rwa_crypto_divergence])

  const risk    = signalData?.risk     ?? { score: 65, label: 'Elevated', color: 'warning' }
  const signals = signalData?.signals  ?? {}
  const riskTx  = signalData?.rialo_reactive_tx ?? {}
  const corrIdx = signalData?.correlation_index ?? 0.48

  const CIRCUMFERENCE = 201
  const riskOffset    = CIRCUMFERENCE - (risk.score / 100) * CIRCUMFERENCE
  const ringColor     = riskColor(risk.score)

  const cryptoAssets = prices?.crypto ? Object.values(prices.crypto).slice(0, 5) : []
  const rwaAssets    = prices?.rwa    ? Object.values(prices.rwa).slice(0, 4)    : []

  return (
    <div>
      {/* ── Network guard (Sepolia required for onchain features) ── */}
      {isConnected && !isOnSepolia && (
        <div className="sd-network-guard">
          <span>Switch to Sepolia Testnet to use onchain features</span>
          <button className="sd-network-switch" onClick={switchToSepolia}>
            Switch Network
          </button>
        </div>
      )}

      {/* ── Staking success toast ─────────────────────────────── */}
      {stakeTx && (
        <div className="sd-stake-toast">{stakeTx}</div>
      )}

      {/* Top metric row */}
      <div className="sd-metrics">
        <div className="sd-card">
          <div className="card-title">
            Portfolio Risk
            <span className="pill pill-live" style={{fontSize:'9px',padding:'2px 7px'}}>
              <span className="dot-pulse"></span> Live
            </span>
          </div>
          <div className="metric-value" style={{color: ringColor}}>{Math.round(risk.score)}</div>
          <div className="metric-label">{risk.label} — out of 100</div>
        </div>
        <div className="sd-card">
          <div className="card-title">Signal Strength</div>
          <div className="metric-value accent">+{(signals.rwa_crypto_divergence ?? 0.74).toFixed(2)}</div>
          <div className="metric-label">Divergence index</div>
        </div>
        <div className="sd-card">
          <div className="card-title">Correlation Index</div>
          <div className="metric-value warn">{corrIdx.toFixed(2)}</div>
          <div className="metric-label">RWA vs Crypto</div>
        </div>
        <div className="sd-card">
          <div className="card-title">
            Reactive TXs
            <span className="pill pill-sdk" style={{fontSize:'9px',padding:'2px 7px'}}>SDK</span>
          </div>
          <div className="metric-value cyan">{txCountRef.current}</div>
          <div className="metric-label">0 bots needed</div>
        </div>
      </div>

      <PipelineFlow />

      {/* ── Signal Tier card ─────────────────────────────────── */}
      {isConnected && (
        <div className={`sd-tier-card ${isPremium ? 'sd-tier-card--premium' : ''}`}>
          {isPremium ? (
            <>
              <div className="sd-tier-left">
                <span className="sd-tier-badge sd-tier-badge--premium">★ Premium Tier</span>
                <div className="sd-tier-title">Full signal access unlocked</div>
                <div className="sd-tier-sub">
                  Staked: {stakeEth.toFixed(4)} ETH · Extended RSI, whale alerts, all signals
                </div>
              </div>
              <button
                className="sd-tier-btn sd-tier-btn--unstake"
                onClick={() => setStakingOpen(true)}
                disabled={stakeLoading}
              >
                Manage Stake
              </button>
            </>
          ) : (
            <>
              <div className="sd-tier-left">
                <span className="sd-tier-badge">Free Tier — Limited Signals</span>
                <div className="sd-tier-title">Stake 0.001 ETH to unlock Premium</div>
                <div className="sd-tier-sub">Extended RSI, whale alerts, full signal access</div>
              </div>
              <button
                className="sd-tier-btn sd-tier-btn--unlock"
                onClick={() => setStakingOpen(true)}
              >
                Unlock Premium
              </button>
            </>
          )}
        </div>
      )}

      {/* Main two-column grid */}
      <div className="sd-grid">
        <div className="sd-col">
          {/* Risk ring card */}
          <div className="sd-card">
            <div className="card-title">Portfolio Risk Score</div>
            <div className="risk-ring-wrap">
              <div className="risk-ring-wrap-inner">
                <svg width="84" height="84" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
                  <circle
                    cx="40" cy="40" r="32"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={riskOffset}
                    transform="rotate(-90 40 40)"
                    style={{transition:'stroke-dashoffset 1s ease,stroke 1s ease'}}
                  />
                </svg>
                <div className="risk-ring-center">
                  <div className="risk-ring-val" style={{color: ringColor}}>{Math.round(risk.score)}</div>
                  <div className="risk-ring-sub">/100</div>
                </div>
              </div>
              <div>
                <div className="risk-title" style={{color: ringColor}}>{risk.label}</div>
                <div className="risk-sub">
                  {riskTx.armed ? riskTx.trigger_reason : 'Portfolio within normal range'}
                </div>
                {riskTx.armed && (
                  <div className="sdk-note sdk-note-sm sdk-note-mt">
                    {riskTx.sdk_note}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signal breakdown */}
          <div className="sd-card">
            <div className="card-title">Signal Breakdown</div>
            <div className="signal-list">
              {Object.entries(SIGNAL_LABELS).map(([key, label]) => {
                const val = signals[key] ?? 0.5
                return (
                  <div className="signal-row" key={key}>
                    <span className="signal-name">{label}</span>
                    <div className="signal-bar-track">
                      <div
                        className="signal-bar-fill"
                        style={{width:`${(val*100).toFixed(0)}%`, background: signalColor(val)}}
                      />
                    </div>
                    <span className={`signal-val ${signalClass(val)}`}>{val.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="sd-col">
          {/* Live asset feeds */}
          <div className="sd-card">
            <div className="card-title">Live Asset Feeds</div>
            <div className="feed-list">
              {cryptoAssets.map(asset => (
                <div className="feed-row crypto" key={asset.symbol}>
                  <div>
                    <div className="feed-name">{asset.symbol}</div>
                    <div className="feed-type">Crypto</div>
                  </div>
                  <div>
                    <div className="feed-price">{formatPrice(asset.price)}</div>
                    <div className={`feed-chg ${changeClass(asset.change_24h)}`}>
                      {formatChange(asset.change_24h)}
                    </div>
                  </div>
                </div>
              ))}
              {rwaAssets.map(asset => (
                <div className="feed-row rwa" key={asset.symbol}>
                  <div>
                    <div className="feed-name">{asset.name || asset.symbol}</div>
                    <div className="feed-type">RWA</div>
                  </div>
                  <div>
                    <div className="feed-price">
                      {asset.symbol === 'US10Y'
                        ? `${asset.price.toFixed(2)}%`
                        : formatPrice(asset.price)}
                    </div>
                    <div className={`feed-chg ${changeClass(asset.change_24h)}`}>
                      {formatChange(asset.change_24h)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reactive TX log */}
          <div className="sd-card">
            <div className="card-title">
              Reactive TX Log
              <span className="pill pill-sdk" style={{fontSize:'9px',padding:'2px 6px'}}>SDK Point</span>
            </div>
            <div className="tx-list">
              {txLog.map((tx, i) => (
                <div className="tx-row" key={i}>
                  <div className={`tx-dot ${tx.type}`}></div>
                  <div className="tx-desc">{tx.desc}</div>
                  <div className="tx-time">{tx.time}</div>
                </div>
              ))}
            </div>
            <div className="sdk-note sdk-note-mt">
              On mainnet: predicates fire inside consensus. Zero bots.
            </div>
          </div>
        </div>
      </div>
      <StakingModal open={stakingOpen} onClose={() => setStakingOpen(false)} />
    </div>
  )
}
