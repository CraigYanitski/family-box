import type { HealthStatus } from '../hooks/useServiceHealth'

const LABELS: Record<HealthStatus, string> = {
  checking: 'Checking…',
  online: 'Online',
  offline: 'Offline',
}

export default function StatusDot({ status }: { status: HealthStatus }) {
  return (
    <span className={`status-dot status-dot--${status}`} title={LABELS[status]}>
      <span className="status-dot__mark" aria-hidden="true" />
      {LABELS[status]}
    </span>
  )
}
