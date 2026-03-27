import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyApplications } from "../../features/jobslice";
import Navbar from "../../components/Navbar";
import Loader from "../../components/Loader";
import "./CandidatePages.css";

const statusBadge = {
  applied:     "badge-blue",
  shortlisted: "badge-green",
  rejected:    "badge-red",
  hired:       "badge-green",
};

function ApplicationsPage() {
  const dispatch = useDispatch();
  const { applications, loading } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, []);

  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <h2 className="page-title">My Applications</h2>

        {loading ? <Loader /> : applications.length === 0 ? (
          <p className="empty-msg">You haven't applied to any jobs yet.</p>
        ) : (
          <div className="applications-list">
            {applications.map((app) => (
              <div key={app.id} className="app-card card">
                <div className="app-header">
                  <div>
                    <h3>{app.jobs?.title}</h3>
                    <p className="job-location">
                      📍 {app.jobs?.location || "Remote"} ·
                      <span className="badge badge-blue" style={{marginLeft:8}}>{app.jobs?.job_type}</span>
                    </p>
                  </div>
                  <span className={`badge ${statusBadge[app.status]}`}>
                    {app.status}
                  </span>
                </div>
                <div className="app-footer">
                  <p className="app-date">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                  {app.ai_match_score && (
                    <p className="match-score">🤖 Match: {app.ai_match_score}%</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ApplicationsPage;