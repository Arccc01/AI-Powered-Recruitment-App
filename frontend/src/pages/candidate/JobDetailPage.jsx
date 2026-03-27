import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { applyToJob } from "../../features/jobslice";
import { getMatchScore } from "../../features/resumeslice";
import Navbar from "../../components/Navbar";
import Loader from "../../components/Loader";
import API from '../../api/axios';
import "./CandidatePages.css";

function JobDetailPage() {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const { loading: applyLoading } = useSelector((state) => state.jobs);
  const { matchResult, loading: matchLoading } = useSelector((state) => state.resume);

  const [job,     setJob]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [msg,     setMsg]     = useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        const { data } = await API.get(`/candidate/jobs/${id}`);
        setJob(data.data.job);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

  async function handleApply() {
    const result = await dispatch(applyToJob(id));
    if (result.meta.requestStatus === "fulfilled") {
      setApplied(true);
      setMsg("Applied successfully!");
    } else {
      setMsg(result.payload);
    }
  }

  async function handleMatchScore() {
    dispatch(getMatchScore(id));
  }

  if (loading) return <><Navbar /><Loader /></>;
  if (!job)    return <><Navbar /><p className="empty-msg">Job not found.</p></>;

  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <button className="btn-outline back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="job-detail-card card">
          <div className="job-detail-header">
            <div>
              <h2>{job.title}</h2>
              <p className="job-location">📍 {job.location || "Remote"} · <span className="badge badge-blue">{job.job_type}</span></p>
            </div>
            <div className="job-detail-actions">
              <button className="btn-outline" onClick={handleMatchScore} disabled={matchLoading}>
                {matchLoading ? "Checking..." : "🤖 Check AI Match"}
              </button>
              <button className="btn-primary" onClick={handleApply} disabled={applyLoading || applied}>
                {applied ? "✅ Applied" : applyLoading ? "Applying..." : "Apply Now"}
              </button>
            </div>
          </div>

          {msg && <p className={msg.includes("success") ? "success-msg" : "error-msg"}>{msg}</p>}

          {/* AI match result */}
          {matchResult && (
            <div className="match-box">
              <h4>AI Match Score: <strong>{matchResult.match_score}%</strong></h4>
              <p>{matchResult.summary}</p>
              <p><strong>Recommendation:</strong> {matchResult.recommendation}</p>
              <div className="match-skills">
                <div>
                  <p className="match-label green">✅ Matching Skills</p>
                  <div className="job-skills">
                    {matchResult.matching_skills?.map(s => <span key={s} className="skill-tag">{s}</span>)}
                  </div>
                </div>
                <div>
                  <p className="match-label red">❌ Missing Skills</p>
                  <div className="job-skills">
                    {matchResult.missing_skills?.map(s => <span key={s} className="skill-tag red">{s}</span>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="job-section">
            <h4>About this role</h4>
            <p>{job.description}</p>
          </div>

          {job.skills_required?.length > 0 && (
            <div className="job-section">
              <h4>Skills Required</h4>
              <div className="job-skills">
                {job.skills_required.map(s => <span key={s} className="skill-tag">{s}</span>)}
              </div>
            </div>
          )}

          {job.salary_min && (
            <div className="job-section">
              <h4>Salary Range</h4>
              <p>💰 ₹{job.salary_min?.toLocaleString()} — ₹{job.salary_max?.toLocaleString()} per year</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default JobDetailPage;