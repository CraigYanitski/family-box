import { useEffect, useState } from 'react'

export type HealthStatus = 'checking' | 'online' | 'offline'

const POLL_INTERVAL_MS = 30_000

export function useServiceHealth(healthCheckPath?: string): HealthStatus {
  const [status, setStatus] = useState<HealthStatus>('checking')

  useEffect(() => {
    if (!healthCheckPath) return
    let cancelled = false

    async function check() {
      try {
        // A short client-side timeout too, in case the server hangs
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)

        const res = await fetch(healthCheckPath!, { signal: controller.signal })
        clearTimeout(timeout)

        if (!cancelled) setStatus(res.ok ? 'online' : 'offline')
      } catch {
        if (!cancelled) setStatus('offline')
      }
    }

    check()
    const interval = setInterval(check, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [healthCheckPath])

  return status
}
