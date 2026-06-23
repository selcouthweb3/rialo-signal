import React from 'react'
import {
  Activity,
  Coins,
  Network,
  Wallet,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Link2,
} from 'lucide-react'
import './Sidebar.css'

const NAV_ITEMS = [
  { id: 'signals', label: 'Signal Engine',     Icon: Activity },
  { id: 'tokens',  label: 'Token Intelligence', Icon: Coins    },
  { id: 'cluster', label: 'Cluster Map',        Icon: Network  },
  { id: 'wallet',  label: 'Wallet Analysis',    Icon: Wallet   },
]

export default function Sidebar({ activePage, onNavigate, onOpenARIA, collapsed, onToggleCollapse }) {
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

        <div className="sb-divider" />

        {/* ARIA nav entry */}
        <button
          className="sb-item sb-item--aria"
          onClick={onOpenARIA}
          title={collapsed ? 'ARIA' : undefined}
          aria-label="Open ARIA"
        >
          <span className="sb-item-icon"><Sparkles size={16} strokeWidth={1.8} /></span>
          {!collapsed && <span className="sb-item-label">ARIA</span>}
        </button>
      </nav>

      {/* Footer */}
      <div className="sb-footer">
        <Link2 size={12} strokeWidth={1.5} />
        {!collapsed && <span>Powered by Rialo</span>}
      </div>

    </aside>
  )
}
