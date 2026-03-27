import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyApplications } from "../../features/jobslice";
import Navbar from "../../components/Navbar";
import Loader from "../../components/Loader";
import "./CandidatePages.css";

function CandidateDashboard() {
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const { user }     = useSelector((state) => state.auth);
  const { applications, loading } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, []);

  const total       = applications.length;
  const shortlisted = applications.filter(a => a.status === "shortlisted").length;
  const rejected    = applications.filter(a => a.status === "rejected").length;
  const hired       = applications.filter(a => a.status === "hired").length;

  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <h2 className="page-title">Welcome back, {user?.full_name} 👋</h2>

        {loading ? <Loader /> : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{total}</h3>
                <p>Total Applications</p>
              </div>
              <div className="stat-card green">
                <h3>{shortlisted}</h3>
                <p>Shortlisted</p>
              </div>
              <div className="stat-card red">
                <h3>{rejected}</h3>
                <p>Rejected</p>
              </div>
              <div className="stat-card blue">
                <h3>{hired}</h3>
                <p>Hired</p>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <div className="action-card" onClick={() => navigate("/candidate/jobs")}>
                  <span>🔍</span>
                  <p>Browse Jobs</p>
                </div>
                <div className="action-card" onClick={() => navigate("/candidate/profile")}>
                  <span>📄</span>
                  <p>Upload Resume</p>
                </div>
                <div className="action-card" onClick={() => navigate("/candidate/applications")}>
                  <span>📋</span>
                  <p>My Applications</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default CandidateDashboard;