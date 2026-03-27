import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchJobs } from "../../features/jobslice";
import Navbar from "../../components/Navbar";
import Loader from "../../components/Loader";
import "./CandidatePages.css";

function JobsPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { jobs, loading } = useSelector((state) => state.jobs);

  const [filters, setFilters] = useState({ search: "", location: "", job_type: "" });

  useEffect(() => {
    dispatch(fetchJobs());
  }, []);

  function handleFilter(e) {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    // remove empty filters
    const clean = Object.fromEntries(Object.entries(updated).filter(([_, v]) => v));
    dispatch(fetchJobs(clean));
  }

  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <h2 className="page-title">Browse Jobs</h2>

        {/* filters */}
        <div className="filters-row">
          <input
            name="search"
            placeholder="Search by title..."
            value={filters.search}
            onChange={handleFilter}
          />
          <input
            name="location"
            placeholder="Location..."
            value={filters.location}
            onChange={handleFilter}
          />
          <select name="job_type" value={filters.job_type} onChange={handleFilter}>
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="remote">Remote</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        {loading ? <Loader /> : (
          <div className="jobs-grid">
            {jobs.length === 0 ? (
              <p className="empty-msg">No jobs found.</p>
            ) : jobs.map((job) => (
              <div key={job.id} className="job-card" onClick={() => navigate(`/candidate/jobs/${job.id}`)}>
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="badge badge-blue">{job.job_type}</span>
                </div>
                <p className="job-location">📍 {job.location || "Remote"}</p>
                <p className="job-desc">{job.description?.slice(0, 120)}...</p>
                <div className="job-skills">
                  {job.skills_required?.slice(0, 4).map((skill) => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
                {job.salary_min && (
                  <p className="job-salary">
                    💰 ₹{job.salary_min?.toLocaleString()} — ₹{job.salary_max?.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default JobsPage;