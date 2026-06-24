const API_BASE = import.meta.env.VITE_API_URL || '/api'
const INTERVAL  = 10 * 60 * 1000   // 10 minutes

export function startKeepAlive() {
  const ping = () => fetch(`${API_BASE}/health`).catch(() => {})
  const id   = setInterval(ping, INTERVAL)
  return id
}
