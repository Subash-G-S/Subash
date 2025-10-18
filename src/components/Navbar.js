import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    window.location.reload(); // refresh to reset state
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link to="/">
        <img src="/ahaarlogopng-32x32.png" alt="ahaarlogo" className="me-2" style={{height:"28px",width:"28px"}}></img>
        </Link>
        <Link className="navbar-brand fw-bold" to="/">
          Ahaar
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            {/* 🔹 Only show Login if NOT logged in */}
            {!user && (
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link" to="/order">Order</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/runner">Runner</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile">Profile</Link>
            </li>

            {/* 🔹 Show Logout only when logged in */}
            {user && (
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
