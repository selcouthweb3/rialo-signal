import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import './RoadmapModal.css'

const PHASES = [
  {
    number: 1,
    title: 'Foundation',
    status: 'complete',
    items: [
      'Project scaffolding (FastAPI + React)',
      'CoinGecko live price feeds',
      'Signal engine (momentum, volatility, RSI, volume spike, risk score)',
      'Deployed to Vercel + Render',
    ],
  },
  {
    number: 2,
    title: 'Visual Layer',
    status: 'complete',
    items: [
      'SVG pipeline diagram',
      'ARIA AI assistant (Claude-powered)',
      'Card hierarchy and micro-interaction system',
      'Skeleton loaders and empty states',
    ],
  },
  {
    number: 3,
    title: 'Intelligence Layer',
    status: 'complete',
    items: [
      'Cluster Map with real entity groupings',
      'Entity drawer with address details',
      'Token Intelligence surface',
      'ARIA context injection',
    ],
  },
  {
    number: 4,
    title: 'Wallet Analysis',
    status: 'complete',
    items: [
      'Etherscan V2 integration',
      'Real ERC-20 holdings with live USD values',
      'Transaction history with failed TX highlighting',
      'Entity cross-referencing and ENS resolution',
    ],
  },
  {
    number: 5,
    title: 'Product Grade',
    status: 'in-progress',
    items: [
      'Sidebar navigation layout',
      'Product-grade UI overhaul',
      'Wallet connection (MetaMask)',
      'Onchain staking and watchlist (Sepolia)',
      'Roadmap modal',
    ],
  },
  {
    number: 6,
    title: 'Rialo Native',
    status: 'upcoming',
    items: [
      'Rialo SDK deep integration',
      'Stake-for-Service mainnet migration',
      'Reactive transaction alerts',
      'DevNet live testing',
    ],
  },
  {
    number: 7,
    title: 'Launch Ready',
    status: 'upcoming',
    items: [
      'Public beta release',
      "Rialo Builder's Hub submission",
      'Documentation and API reference',
      'Community signal contributions',
    ],
  },
]

const BADGE = {
  complete:    { label: 'Complete',    cls: 'rm-badge--complete'    },
  'in-progress': { label: 'In Progress', cls: 'rm-badge--progress' },
  upcoming:    { label: 'Upcoming',    cls: 'rm-badge--upcoming'    },
}

export default function RoadmapModal({ open, onClose }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="rm-overlay"
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="rm-card" role="dialog" aria-modal="true">

        <div className="rm-header">
          <div className="rm-header-text">
            <div className="rm-title">Rialo Signal Roadmap</div>
            <div className="rm-subtitle">Building onchain intelligence on Rialo primitives</div>
          </div>
          <button className="rm-close" onClick={onClose} aria-label="Close roadmap">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="rm-scroll">
          <div className="rm-timeline">
            {PHASES.map((phase, idx) => (
              <div
                key={phase.number}
                className={`rm-phase rm-phase--${phase.status}`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="rm-phase-left">
                  <div className={`rm-dot rm-dot--${phase.status}`} />
                  {idx < PHASES.length - 1 && <div className="rm-line" />}
                </div>
                <div className="rm-phase-right">
                  <div className="rm-phase-header">
                    <span className="rm-phase-num">Phase {phase.number}</span>
                    <span className="rm-phase-title">{phase.title}</span>
                    <span className={`rm-badge ${BADGE[phase.status].cls}`}>
                      {BADGE[phase.status].label}
                    </span>
                  </div>
                  <ul className="rm-items">
                    {phase.items.map((item, i) => (
                      <li key={i} className="rm-item">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
