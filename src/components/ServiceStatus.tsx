import { useServiceHealth } from '../hooks/useServiceHealth'
import StatusDot from './StatusDot'

interface Props {
  healthCheckPath: string
  repeat?: boolean
}

export default function ServiceStatus({ healthCheckPath, repeat }: Props) {
  const status = useServiceHealth(healthCheckPath, repeat)
  return <StatusDot status={status} />
}
