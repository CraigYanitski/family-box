import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1 className="not-found__title">Page not found</h1>
      <p className="not-found__desc">
        There is nothing here at the moment...
      </p>
      <Link to="/" className="btn btn--primarry">
        Back to Home page
      </Link>
    </div>
  )
}
