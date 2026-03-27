import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <nav className="landing-nav">
        <h1 className="logo">HireAI</h1>
        <div className="nav-links">
          <button className="btn-outline" onClick={() => navigate("/login")}>Login</button>
          <button className="btn-primary" onClick={() => navigate("/signup")}>Get Started</button>
        </div>
      </nav>

      <section className="hero">
        <h1>AI-Powered Recruitment</h1>
        <p>Match the right candidates with the right jobs using the power of AI</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => navigate("/signup")}>
            Find Jobs
          </button>
          <button className="btn-outline" onClick={() => navigate("/signup")}>
            Post a Job
          </button>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <span>🤖</span>
          <h3>AI Resume Parsing</h3>
          <p>Upload your resume and let AI automatically fill your profile</p>
        </div>
        <div className="feature-card">
          <span>🎯</span>
          <h3>Smart Job Matching</h3>
          <p>Get AI match scores for every job based on your skills</p>
        </div>
        <div className="feature-card">
          <span>📊</span>
          <h3>Candidate Ranking</h3>
          <p>Recruiters see applicants ranked by AI compatibility score</p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;