import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { signup, clearError } from "../features/authslice";
import "./AuthPage.css";

function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "", password: "", full_name: "",
    role: "candidate", city: "", phone: "",
  });

  useEffect(() => {
    if (user) {
      navigate(user.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard");
    }
  }, [user]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await dispatch(signup(form));
    if (result.meta.requestStatus === "fulfilled") {
      const role = result.payload.user.role;
      navigate(role === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create account</h2>
        <p className="auth-sub">Join HireAI today</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="full_name" placeholder="John Doe" value={form.full_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="john@gmail.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>I am a</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="candidate">Candidate — looking for jobs</option>
              <option value="recruiter">Recruiter — hiring talent</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City (optional)</label>
              <input name="city" placeholder="Mumbai" value={form.city} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone (optional)</label>
              <input name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          <button className="btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;