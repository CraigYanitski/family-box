import { useServiceHealth } from '../hooks/useServiceHealth'
import StatusDot from './StatusDot'

interface Props {
  healthCheckPath: string
}

export default function ServiceStatus({ healthCheckPath }: Props) {
  const status = useServiceHealth(healthCheckPath)
  return <StatusDot status={status} />
}
