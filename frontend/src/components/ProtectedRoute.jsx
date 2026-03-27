import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ role }) {
  const { user, token,initializing } = useSelector((state) => state.auth);

  
  if (initializing && token && !user) {
    return <Loader />;
  }

  // not logged in
  if (!token) return <Navigate to="/login" />;

  // wrong role
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard"} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;