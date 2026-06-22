import React, { useEffect, useRef } from 'react'
import { X, Copy, ExternalLink } from 'lucide-react'
import { formatPrice } from '../../utils/format'
import './EntityDrawer.css'

const CATEGORY_COLORS = {
  cex:    '#A78BFA',
  whale:  '#22D3EE',
  alpha:  '#FBBF24',
  fund:   '#34D399',
  retail: '#71717A',
}

const CATEGORY_LABELS = {
  cex:    'CEX',
  whale:  'Whale',
  alpha:  'Alpha Trader',
  fund:   'VC / Fund',
  retail: 'Retail',
}

export default function EntityDrawer({ entity, onClose }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!entity) return null

  const color    = CATEGORY_COLORS[entity.category] || '#fff'
  const catLabel = CATEGORY_LABELS[entity.category]  || entity.category
  const isReal   = entity.category === 'cex'

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  function copyAddress() {
    if (entity.address) navigator.clipboard.writeText(entity.address)
  }

  return (
    <div className="ed-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="ed-drawer">

        <div className="ed-header">
          <span className="ed-title" style={{ color }}>{entity.label}</span>
          <button className="ed-close" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div
          className="ed-badge"
          style={{ color, borderColor: color + '55', background: color + '18' }}
        >
          {catLabel}
        </div>

        <div className="ed-divider" />

        <div className="ed-field">
          <div className="ed-field-label">Net Worth</div>
          <div className="ed-field-value" style={{ color }}>{formatPrice(entity.netWorth)}</div>
        </div>

        <div className="ed-field">
          <div className="ed-field-label">Address</div>
          <div className="ed-addr-row">
            <code className="ed-addr">{entity.address}</code>
            <button className="ed-copy" onClick={copyAddress} aria-label="Copy address">
              <Copy size={12} />
            </button>
          </div>
        </div>

        {entity.notes && (
          <div className="ed-field">
            <div className="ed-field-label">Notes</div>
            <div className="ed-notes">{entity.notes}</div>
          </div>
        )}

        {isReal && (
          <a
            className="ed-etherscan"
            href={`https://etherscan.io/address/${entity.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={12} />
            View on Etherscan
          </a>
        )}

      </div>
    </div>
  )
}
