import React from 'react'
import { Database, Cpu, Sparkles, Zap } from 'lucide-react'
import './PipelineFlow.css'

const NODES = [
  { id: 'cg',  Icon: Database,  label: 'CoinGecko',     sub: '+ RWA feeds',  status: 'active'     },
  { id: 'sig', Icon: Cpu,       label: 'Signal Engine',  sub: 'PRISM v1',     status: 'active'     },
  { id: 'ai',  Icon: Sparkles,  label: 'AI Layer',       sub: 'ARIA · Groq',  status: 'processing' },
  { id: 'out', Icon: Zap,       label: 'Reactive TX',    sub: 'SDK ready',    status: 'idle'       },
]

export default function PipelineFlow() {
  return (
    <div className="pf-wrap">
      <div className="pf-header">
        <div className="card-title">Live data pipeline</div>
        <div className="pf-legend">
          <span className="pf-leg pf-leg-active"><span className="pf-leg-dot"></span>Live</span>
          <span className="pf-leg pf-leg-processing"><span className="pf-leg-dot"></span>Processing</span>
          <span className="pf-leg pf-leg-idle"><span className="pf-leg-dot"></span>SDK Ready</span>
        </div>
      </div>
      <div className="pf-pipeline">
        {NODES.map((node, i) => (
          <React.Fragment key={node.id}>
            <div className={`pf-node pf-node-${node.status}`}>
              <div className="pf-icon-wrap">
                <node.Icon size={20} strokeWidth={1.5} />
                <span className={`pf-dot pf-dot-${node.status}`} />
              </div>
              <div className="pf-label">{node.label}</div>
              <div className="pf-sub">{node.sub}</div>
            </div>
            {i < NODES.length - 1 && (
              <div className="pf-connector">
                <div className="pf-line" />
                <div className="pf-arrowhead" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
