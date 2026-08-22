import { Link } from 'react-router-dom'
import { services } from '../config/services'
import ServiceStatus from '../components/ServiceStatus'
import PageBody from '../components/PageBody'

export default function Home() {
  return (
    <div>
      <PageBody>
        This is a local website to add some convenient services for you to access via your web browser.
        The recipe server is will remain available since it is hosted on your DNS blocker,
        but the image and video servers are hosted on your workstation.
        These have indicators to show if they are available.
        If they are offline, just log into your workstation and the file server should start.
      </PageBody>
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
