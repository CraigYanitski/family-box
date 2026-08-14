import { Link, NavLink, Outlet } from 'react-router-dom'
import { services } from '../config/services'

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
                <NavLink
                  key={s.id}
                  to={s.path}
                  className={
                    ({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
                  }
                >
                  {s.name}
                </NavLink>
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
