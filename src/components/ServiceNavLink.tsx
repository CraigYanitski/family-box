import { NavLink } from 'react-router-dom'
import type { Service } from '../config/services'
import { useServiceHealth } from '../hooks/useServiceHealth'
import StatusDot from './StatusDot'

export default function ServiceNavLink({ service }: { service: Service }) {
  const status = useServiceHealth(service.healthCheckPath)

  return (
    <NavLink
      to={service.path}
      className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
    >
      {service.name}
      {service.healthCheckPath && <StatusDot status={status} />}
    </NavLink>
  )
}
