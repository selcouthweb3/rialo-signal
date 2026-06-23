import React from 'react'
import {
  Activity,
  Coins,
  Network,
  Wallet,
  BookMarked,
  Route,
  ChevronLeft,
  ChevronRight,
  Link2,
} from 'lucide-react'
import './Sidebar.css'

const NAV_ITEMS = [
  { id: 'signals',   label: 'Signal Engine',     Icon: Activity   },
  { id: 'tokens',    label: 'Token Intelligence', Icon: Coins      },
  { id: 'cluster',   label: 'Cluster Map',        Icon: Network    },
  { id: 'wallet',    label: 'Wallet Analysis',    Icon: Wallet     },
  { id: 'watchlist', label: 'Watchlist',          Icon: BookMarked },
]

export default function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse, onOpenRoadmap }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>

      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-monogram">RS</div>
        {!collapsed && (
          <div className="sb-brand">
            <div className="sb-brand-name">Rialo Signal</div>
            <div className="sb-brand-sub">Intelligence Terminal</div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        className="sb-collapse"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed
          ? <ChevronRight size={14} strokeWidth={2} />
          : <ChevronLeft  size={14} strokeWidth={2} />
        }
      </button>

      {/* Primary nav */}
      <nav className="sb-nav">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`sb-item ${activePage === id ? 'sb-item--active' : ''}`}
            onClick={() => onNavigate(id)}
            title={collapsed ? label : undefined}
            aria-label={label}
          >
            <span className="sb-item-icon"><Icon size={16} strokeWidth={1.8} /></span>
            {!collapsed && <span className="sb-item-label">{label}</span>}
          </button>
        ))}

      </nav>

      {/* Roadmap button */}
      <div className="sb-roadmap-area">
        <button
          className="sb-roadmap-btn"
          onClick={onOpenRoadmap}
          title={collapsed ? 'Roadmap' : undefined}
          aria-label="View roadmap"
        >
          <Route size={14} strokeWidth={1.8} />
          {!collapsed && <span>Roadmap</span>}
        </button>
      </div>

      {/* Footer */}
      <div className="sb-footer">
        <Link2 size={12} strokeWidth={1.5} />
        {!collapsed && <span>Powered by Rialo</span>}
      </div>

    </aside>
  )
}
