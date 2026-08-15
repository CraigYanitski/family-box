import { Link, Outlet } from 'react-router-dom'
import { services } from '../config/services'
import ServiceNavLink from './ServiceNavLink'

export default function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-title">
            Yanitski<span className="site-title__mark">Box</span>
          </Link>
          <nav className='site-nav'>
            {services
              .filter((s) => s.status === "available")
              .map((s) => (
                <ServiceNavLink key={s.id} service={s} />
              ))}
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </>
  )
}
