import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyJobs } from "../../features/jobslice";
import Navbar from "../../components/Navbar";
import Loader from "../../components/Loader";
import "./RecruiterPages.css";

function MyJobsPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { myJobs, loading } = useSelector((state) => state.jobs);

  useEffect(() => { dispatch(fetchMyJobs()); }, []);

  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <div className="page-header">
          <h2 className="page-title">My Posted Jobs</h2>
          <button className="btn-primary" onClick={() => navigate("/recruiter/post-job")}>
            + Post New Job
          </button>
        </div>

        {loading ? <Loader /> : myJobs.length === 0 ? (
          <p className="empty-msg">No jobs posted yet.</p>
        ) : (
          <div className="recruiter-jobs-list">
            {myJobs.map((job) => (
              <div key={job.id} className="card recruiter-job-card">
                <div className="rjob-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="job-location">
                      📍 {job.location || "Remote"} ·
                      <span className="badge badge-blue" style={{marginLeft:8}}>{job.job_type}</span>
                      <span className={`badge ${job.is_active ? "badge-green" : "badge-red"}`} style={{marginLeft:8}}>
                        {job.is_active ? "Active" : "Closed"}
                      </span>
                    </p>
                  </div>
                  <button
                    className="btn-outline"
                    onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                  >
                    View Applicants
                  </button>
                </div>
                <p className="job-desc">{job.description?.slice(0, 150)}...</p>
                <p className="post-date">Posted: {new Date(job.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default MyJobsPage;