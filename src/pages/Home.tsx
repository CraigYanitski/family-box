import { Link } from 'react-router-dom'
import { services } from '../config/services'
import ServiceStatus from '../components/ServiceStatus'

export default function Home() {
  return (
    <div>
      <p className="section-label">Services</p>
      <div className="service-grid">
        {services.map((service) => {
          const card = (
            <>
              <div className="service-card__header">
                <h3 className="service-card__name">{service.name}</h3>
                {service.healthCheckPath && (
                    <ServiceStatus healthCheckPath={service.healthCheckPath} repeat={true} />
                )}
              </div>
              <p className="service-card__desc">{service.description}</p>
              {service.status === 'coming-soon' && (
                <span className="service-card__badge">Coming soon</span>
              )}
            </>
          )

          return service.status === 'available' ? (
            <Link key={service.id} to={service.path} className="service-card">
              {card}
            </Link>
          ) : (
            <div key={service.id} className="service-card service-card--disabled">
              {card}
            </div>
          )
        })}
      </div>
    </div>
  )
}
