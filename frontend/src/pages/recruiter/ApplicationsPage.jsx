import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplicants } from "../../features/jobslice";
import Navbar from "../../components/Navbar";
import Loader from "../../components/Loader";
import API from "../../api/axios";
import "./RecruiterPages.css";

const statusColors = {
  applied:     "badge-blue",
  shortlisted: "badge-green",
  rejected:    "badge-red",
  hired:       "badge-green",
};

function ApplicantsPage() {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { applicants, loading } = useSelector((state) => state.jobs);

  useEffect(() => { dispatch(fetchApplicants(id)); }, [id]);

  async function handleStatus(appId, status) {
    await API.put(`/recruiter/applications/${appId}/status`, { status });
    dispatch(fetchApplicants(id)); // refresh list
  }

  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <button className="btn-outline back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2 className="page-title">Applicants</h2>

        {loading ? <Loader /> : applicants.length === 0 ? (
          <p className="empty-msg">No applicants yet.</p>
        ) : (
          <div className="applicants-list">
            {applicants.map((app) => (
              <div key={app.id} className="card applicant-card">
                <div className="applicant-header">
                  <div className="applicant-avatar">
                    {app.users_meta?.full_name?.[0]}
                  </div>
                  <div className="applicant-info">
                    <h3>{app.users_meta?.full_name}</h3>
                    <p>{app.users_meta?.email}</p>
                    {app.profiles?.city && <p>📍 {app.profiles.city}</p>}
                  </div>
                  <div className="applicant-right">
                    {app.ai_match_score && (
                      <div className="ai-score">
                        <span>🤖</span>
                        <strong>{app.ai_match_score}%</strong>
                        <p>AI Match</p>
                      </div>
                    )}
                    <span className={`badge ${statusColors[app.status]}`}>{app.status}</span>
                  </div>
                </div>

                <div className="applicant-actions">
                  <button
                    className="btn-outline"
                    onClick={() => handleStatus(app.id, "shortlisted")}
                    disabled={app.status === "shortlisted"}
                  >
                    ✅ Shortlist
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => handleStatus(app.id, "hired")}
                    disabled={app.status === "hired"}
                  >
                    🎉 Hire
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleStatus(app.id, "rejected")}
                    disabled={app.status === "rejected"}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ApplicantsPage;