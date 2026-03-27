import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { postJob } from "../../features/jobslice";
import Navbar from "../../components/Navbar";
import "./RecruiterPages.css";

function PostJobPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading } = useSelector((state) => state.jobs);

  const [form, setForm] = useState({
    title: "", description: "", location: "",
    job_type: "full-time", salary_min: "", salary_max: "",
  });
  const [skillInput, setSkillInput]     = useState("");
  const [skills,     setSkills]         = useState([]);
  const [msg,        setMsg]            = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function addSkill() {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  }

  function removeSkill(skill) {
    setSkills(skills.filter(s => s !== skill));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await dispatch(postJob({
      ...form,
      skills_required: skills,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
    }));
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/recruiter/jobs");
    } else {
      setMsg(result.payload);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <h2 className="page-title">Post a New Job</h2>
        <div className="card form-card">
          {msg && <p className="error-msg">{msg}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Title *</label>
              <input name="title" placeholder="e.g. Frontend Developer" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" rows={5} placeholder="Describe the role, responsibilities..." value={form.description} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input name="location" placeholder="Mumbai / Remote" value={form.location} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Job Type *</label>
                <select name="job_type" value={form.job_type} onChange={handleChange}>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="remote">Remote</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Min Salary (₹)</label>
                <input type="number" name="salary_min" placeholder="500000" value={form.salary_min} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Max Salary (₹)</label>
                <input type="number" name="salary_max" placeholder="800000" value={form.salary_max} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Skills Required</label>
              <div className="skill-input-row">
                <input
                  placeholder="Add a skill and press Add"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <button type="button" className="btn-outline" onClick={addSkill}>Add</button>
              </div>
              <div className="job-skills" style={{marginTop:8}}>
                {skills.map(s => (
                  <span key={s} className="skill-tag removable" onClick={() => removeSkill(s)}>
                    {s} ✕
                  </span>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Posting..." : "Post Job"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default PostJobPage;