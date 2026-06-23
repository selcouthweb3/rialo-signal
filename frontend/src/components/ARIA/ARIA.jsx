import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'
import './ARIA.css'

const SUGGESTIONS = [
  'Why is my risk elevated?',
  'What is RWA/Crypto divergence?',
  'Explain Stake-for-Service',
  'Why is BTC pumping?',
  'What are reactive transactions?',
  'Analyze current signals',
]

const WELCOME = {
  role: 'aria',
  text: "Hi, I'm ARIA — your Rialo Signal intelligence assistant. Ask me anything about your portfolio risk, current signals, token analysis, or how Rialo works. I'm aware of live market data right now.",
}

export default function ARIA({ open, onClose, wallet = '' }) {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape' && open) onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  async function sendMessage(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api'
      const resp = await fetch(`${apiBase}/chat/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: msg, wallet }),
      })
      const data = await resp.json()
      setMessages(prev => [...prev, { role: 'aria', text: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'aria', text: 'I had trouble connecting. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  if (!open) return null

  return (
    <>
      {/* Click-outside overlay */}
      <div className="aria-overlay" onClick={onClose} />

      <div className="aria-panel">
        {/* Header */}
        <div className="aria-header">
          <div className="aria-avatar">
            <Sparkles size={14} strokeWidth={1.5} />
          </div>
          <div className="aria-header-info">
            <div className="aria-name">ARIA</div>
            <div className="aria-status">
              <span className="aria-status-dot" />
              AI Intelligence
            </div>
          </div>
          <button className="aria-close" onClick={onClose} aria-label="Close ARIA">
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Messages */}
        <div className="aria-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-wrap ${msg.role === 'user' ? 'user' : ''}`}>
              <div className={`msg-avatar ${msg.role === 'aria' ? 'aria-av' : 'user-av'}`}>
                {msg.role === 'aria' ? <Sparkles size={11} strokeWidth={1.5} /> : 'U'}
              </div>
              <div className={`msg-bubble ${msg.role === 'aria' ? 'aria-bubble' : 'user-bubble'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="msg-wrap">
              <div className="msg-avatar aria-av">
                <Sparkles size={11} strokeWidth={1.5} />
              </div>
              <div className="msg-bubble aria-bubble">
                <div className="msg-typing">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="aria-suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="aria-suggest-btn" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="aria-input-row">
          <textarea
            ref={inputRef}
            className="aria-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask ARIA anything…"
            rows={1}
          />
          <button
            className="aria-send"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            ➤
          </button>
        </div>
      </div>
    </>
  )
}
