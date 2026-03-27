import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../features/authslice";
import "./Navbar.css";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user }  = useSelector((state) => state.auth);

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  const isCandidate = user?.role === "candidate";

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">HireME</Link>

      <div className="nav-links">
        {isCandidate ? (
          <>
            <Link to="/candidate/dashboard">Dashboard</Link>
            <Link to="/candidate/jobs">Browse Jobs</Link>
            <Link to="/candidate/applications">Applications</Link>
            <Link to="/candidate/profile">Profile</Link>
          </>
        ) : (
          <>
            <Link to="/recruiter/dashboard">Dashboard</Link>
            <Link to="/recruiter/jobs">My Jobs</Link>
            <Link to="/recruiter/post-job">Post Job</Link>
          </>
        )}
      </div>

      <div className="nav-right">
        <span className="nav-user">{user?.full_name}</span>
        <button className="btn-outline" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;