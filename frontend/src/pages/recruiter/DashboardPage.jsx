import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyJobs } from "../../features/jobslice";
import Navbar from "../../components/Navbar";
import Loader from "../../components/Loader";
import "./RecruiterPages.css";

function RecruiterDashboard() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((state) => state.auth);
  const { myJobs, loading } = useSelector((state) => state.jobs);

  useEffect(() => { dispatch(fetchMyJobs()); }, []);

  const active   = myJobs.filter(j => j.is_active).length;
  const inactive = myJobs.filter(j => !j.is_active).length;

  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <h2 className="page-title">Welcome, {user?.full_name} 👋</h2>

        {loading ? <Loader /> : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{myJobs.length}</h3>
                <p>Total Jobs Posted</p>
              </div>
              <div className="stat-card green">
                <h3>{active}</h3>
                <p>Active Jobs</p>
              </div>
              <div className="stat-card red">
                <h3>{inactive}</h3>
                <p>Closed Jobs</p>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <div className="action-card" onClick={() => navigate("/recruiter/post-job")}>
                  <span>➕</span><p>Post New Job</p>
                </div>
                <div className="action-card" onClick={() => navigate("/recruiter/jobs")}>
                  <span>📋</span><p>View My Jobs</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default RecruiterDashboard;