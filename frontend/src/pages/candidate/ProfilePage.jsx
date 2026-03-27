import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import Loader from "../../components/Loader";
import { uploadResume } from "../../features/resumeslice";
import {
  fetchMyProfile, updateProfile, fetchCompletion,
  addExperience, updateExperience, deleteExperience,
  addSkill, deleteSkill,
  addProject, updateProject, deleteProject,
} from "../../features/profileslice";

import profileAPI from "../../api/profile.api.js";
console.log("Profile api is:",profileAPI)
import "./ProfilePage.css";

// ── small reusable components ──────────────────────────────────────────────

function CompletionBar({ percent }) {
  return (
    <div className="completion-wrap">
      <div className="completion-label">
        <span>Profile Completion</span>
        <strong>{percent}%</strong>
      </div>
      <div className="completion-bar">
        <div className="completion-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div className="card section-card">
      <div className="section-header">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

function ProfilePage() {
  const dispatch = useDispatch();
  const { profile, experiences, skills, projects, completion, loading } =
    useSelector((state) => state.profile);
  const { loading: resumeLoading, parsed, resumeUrl } =
    useSelector((state) => state.resume);

  const [activeTab, setActiveTab]         = useState("overview");
  const [lastSaved, setLastSaved]         = useState(null);
  const [resumeMsg, setResumeMsg]         = useState("");
  const [resumeFile, setResumeFile]       = useState(null);

  // edit profile form
  const [editMode,  setEditMode]          = useState(false);
  const [profileForm, setProfileForm]     = useState({});

  // experience form
  const [showExpForm,  setShowExpForm]    = useState(false);
  const [editingExp,   setEditingExp]     = useState(null);
  const [expForm,      setExpForm]        = useState({
    company: "", role: "", start_date: "", end_date: "", is_current: false, description: ""
  });

  // skill form
  const [skillInput, setSkillInput]       = useState("");

  // project form
  const [showProjForm,  setShowProjForm]  = useState(false);
  const [editingProj,   setEditingProj]   = useState(null);
  const [projForm,      setProjForm]      = useState({
    title: "", description: "", tech_stack: ""
  });

  // load on mount
  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchCompletion());
    loadLastSaved();
  }, []);

  // sync profile form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        city:      profile.city      || "",
        phone:     profile.phone     || "",
        headline:  profile.headline  || "",
        summary:   profile.summary   || "",
      });
    }
  }, [profile]);

  async function loadLastSaved() {
    try {
      const { data } = await profileAPI.getLastSaved();
      setLastSaved(data.data?.last_saved_at);
    } catch {}
  }

  // ── autosave ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editMode || !profileForm.full_name) return;
    const timer = setTimeout(async () => {
      try {
        await profileAPI.autosave(profileForm);
        setLastSaved(new Date().toISOString());
      } catch {}
    }, 2000); // autosave after 2s of no typing
    return () => clearTimeout(timer);
  }, [profileForm, editMode]);

  // ── profile update ────────────────────────────────────────────────────────
  async function handleProfileSave() {
    await dispatch(updateProfile(profileForm));
    setEditMode(false);
    dispatch(fetchCompletion());
  }

  // ── resume upload ─────────────────────────────────────────────────────────
  async function handleResumeUpload() {
    if (!resumeFile) return setResumeMsg("Please select a PDF file.");
    const result = await dispatch(uploadResume(resumeFile));
    if (result.meta.requestStatus === "fulfilled") {
      setResumeMsg("Resume uploaded and profile auto-filled!");
      dispatch(fetchMyProfile());
      dispatch(fetchCompletion());
    } else {
      setResumeMsg(result.payload);
    }
  }

  // ── experience ────────────────────────────────────────────────────────────
  function openExpForm(exp = null) {
    if (exp) {
      setEditingExp(exp);
      setExpForm({
        company:    exp.company    || "",
        role:       exp.role       || "",
        start_date: exp.start_date || "",
        end_date:   exp.end_date   || "",
        is_current: exp.is_current || false,
        description:exp.description|| "",
      });
    } else {
      setEditingExp(null);
      setExpForm({ company:"", role:"", start_date:"", end_date:"", is_current:false, description:"" });
    }
    setShowExpForm(true);
  }

  async function handleExpSubmit() {
    if (editingExp) {
      await dispatch(updateExperience({ id: editingExp.id, expData: expForm }));
    } else {
      await dispatch(addExperience(expForm));
    }
    setShowExpForm(false);
    dispatch(fetchCompletion());
  }

  // ── skills ────────────────────────────────────────────────────────────────
  async function handleAddSkill() {
    if (!skillInput.trim()) return;
    await dispatch(addSkill({ name: skillInput.trim() }));
    setSkillInput("");
    dispatch(fetchCompletion());
  }

  // ── projects ─────────────────────────────────────────────────────────────
  function openProjForm(proj = null) {
    if (proj) {
      setEditingProj(proj);
      setProjForm({
        title:       proj.title       || "",
        description: proj.description || "",
        tech_stack:  Array.isArray(proj.tech_stack) ? proj.tech_stack.join(", ") : "",
      });
    } else {
      setEditingProj(null);
      setProjForm({ title:"", description:"", tech_stack:"" });
    }
    setShowProjForm(true);
  }

  async function handleProjSubmit() {
    const payload = {
      ...projForm,
      tech_stack: projForm.tech_stack.split(",").map(t => t.trim()).filter(Boolean),
    };
    if (editingProj) {
      await dispatch(updateProject({ id: editingProj.id, projData: payload }));
    } else {
      await dispatch(addProject(payload));
    }
    setShowProjForm(false);
    dispatch(fetchCompletion());
  }

  if (loading && !profile) return <><Navbar /><Loader /></>;

  return (
    <>
      <Navbar />
      <div className="profile-page">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="profile-sidebar">
          <div className="card avatar-card">
            <div className="big-avatar">{profile?.full_name?.[0]}</div>
            <h3>{profile?.full_name}</h3>
            <p className="headline-text">{profile?.headline || "Add a headline"}</p>
            <p className="city-text">📍 {profile?.city || "Add city"}</p>
            {lastSaved && (
              <p className="last-saved">
                Last saved: {new Date(lastSaved).toLocaleTimeString()}
              </p>
            )}
            <CompletionBar percent={completion} />
          </div>

          {/* tab nav */}
          <nav className="profile-nav">
            {["overview","experience","skills","projects","resume"].map(tab => (
              <button
                key={tab}
                className={`nav-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="profile-main">

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <SectionCard
              title="Basic Info"
              action={
                editMode
                  ? <div style={{display:"flex",gap:8}}>
                      <button className="btn-outline" onClick={() => setEditMode(false)}>Cancel</button>
                      <button className="btn-primary" onClick={handleProfileSave}>Save</button>
                    </div>
                  : <button className="btn-outline" onClick={() => setEditMode(true)}>Edit</button>
              }
            >
              {editMode ? (
                <div className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input value={profileForm.city} onChange={e => setProfileForm({...profileForm, city: e.target.value})} placeholder="Mumbai" />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="9876543210" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Headline</label>
                    <input value={profileForm.headline} onChange={e => setProfileForm({...profileForm, headline: e.target.value})} placeholder="Frontend Developer with 2 years experience" />
                  </div>
                  <div className="form-group">
                    <label>Summary</label>
                    <textarea rows={4} value={profileForm.summary} onChange={e => setProfileForm({...profileForm, summary: e.target.value})} placeholder="Write a short professional summary..." />
                  </div>
                  <p className="autosave-hint">💾 Autosaving as you type...</p>
                </div>
              ) : (
                <div className="profile-view">
                  <div className="info-row"><span>Email</span><p>{profile?.email}</p></div>
                  <div className="info-row"><span>Phone</span><p>{profile?.phone || "—"}</p></div>
                  <div className="info-row"><span>City</span><p>{profile?.city  || "—"}</p></div>
                  <div className="info-row"><span>Headline</span><p>{profile?.headline || "—"}</p></div>
                  {profile?.summary && (
                    <div className="summary-block">
                      <span>Summary</span>
                      <p>{profile.summary}</p>
                    </div>
                  )}
                  {profile?.resume_url && (
                    <a href={profile.resume_url} target="_blank" rel="noreferrer" className="resume-link">
                      📄 View Resume
                    </a>
                  )}
                </div>
              )}
            </SectionCard>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === "experience" && (
            <SectionCard
              title="Experience"
              action={<button className="btn-primary" onClick={() => openExpForm()}>+ Add</button>}
            >
              {showExpForm && (
                <div className="inline-form card">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Company *</label>
                      <input value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} placeholder="Google" />
                    </div>
                    <div className="form-group">
                      <label>Role *</label>
                      <input value={expForm.role} onChange={e => setExpForm({...expForm, role: e.target.value})} placeholder="Backend Developer" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input value={expForm.start_date} onChange={e => setExpForm({...expForm, start_date: e.target.value})} placeholder="Jan 2022" />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input value={expForm.end_date} onChange={e => setExpForm({...expForm, end_date: e.target.value})} placeholder="Dec 2023" disabled={expForm.is_current} />
                    </div>
                  </div>
                  <div className="form-group check-group">
                    <input type="checkbox" id="is_current" checked={expForm.is_current} onChange={e => setExpForm({...expForm, is_current: e.target.checked, end_date: ""})} />
                    <label htmlFor="is_current">Currently working here</label>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows={3} value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} placeholder="Describe your responsibilities..." />
                  </div>
                  <div className="form-actions">
                    <button className="btn-outline" onClick={() => setShowExpForm(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleExpSubmit}>
                      {editingExp ? "Update" : "Add"} Experience
                    </button>
                  </div>
                </div>
              )}

              {experiences.length === 0 && !showExpForm ? (
                <p className="empty-section">No experience added yet.</p>
              ) : experiences.map(exp => (
                <div key={exp.id} className="exp-item">
                  <div className="exp-header">
                    <div>
                      <h4>{exp.role}</h4>
                      <p className="exp-company">{exp.company}</p>
                      <p className="exp-date">{exp.start_date} — {exp.is_current ? "Present" : exp.end_date}</p>
                    </div>
                    <div className="item-actions">
                      <button className="btn-outline sm" onClick={() => openExpForm(exp)}>Edit</button>
                      <button className="btn-danger sm" onClick={() => dispatch(deleteExperience(exp.id))}>Delete</button>
                    </div>
                  </div>
                  {exp.description && <p className="exp-desc">{exp.description}</p>}
                </div>
              ))}
            </SectionCard>
          )}

          {/* SKILLS TAB */}
          {activeTab === "skills" && (
            <SectionCard title="Skills">
              <div className="skill-add-row">
                <input
                  placeholder="Type a skill and press Add"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddSkill()}
                />
                <button className="btn-primary" onClick={handleAddSkill}>Add</button>
              </div>

              {skills.length === 0 ? (
                <p className="empty-section">No skills added yet.</p>
              ) : (
                <div className="skills-wrap">
                  {skills.map(skill => (
                    <div key={skill.id} className="skill-chip">
                      <span>{skill.name}</span>
                      <button onClick={() => dispatch(deleteSkill(skill.id))}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {/* PROJECTS TAB */}
          {activeTab === "projects" && (
            <SectionCard
              title="Projects"
              action={<button className="btn-primary" onClick={() => openProjForm()}>+ Add</button>}
            >
              {showProjForm && (
                <div className="inline-form card">
                  <div className="form-group">
                    <label>Project Title *</label>
                    <input value={projForm.title} onChange={e => setProjForm({...projForm, title: e.target.value})} placeholder="AI Resume Parser" />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows={3} value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})} placeholder="What did you build and what problem did it solve?" />
                  </div>
                  <div className="form-group">
                    <label>Tech Stack (comma separated)</label>
                    <input value={projForm.tech_stack} onChange={e => setProjForm({...projForm, tech_stack: e.target.value})} placeholder="React, Node.js, Supabase" />
                  </div>
                  <div className="form-actions">
                    <button className="btn-outline" onClick={() => setShowProjForm(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleProjSubmit}>
                      {editingProj ? "Update" : "Add"} Project
                    </button>
                  </div>
                </div>
              )}

              {projects.length === 0 && !showProjForm ? (
                <p className="empty-section">No projects added yet.</p>
              ) : projects.map(proj => (
                <div key={proj.id} className="proj-item">
                  <div className="exp-header">
                    <div>
                      <h4>{proj.title}</h4>
                      {proj.description && <p className="exp-desc">{proj.description}</p>}
                      <div className="tech-tags">
                        {proj.tech_stack?.map(t => (
                          <span key={t} className="skill-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="item-actions">
                      <button className="btn-outline sm" onClick={() => openProjForm(proj)}>Edit</button>
                      <button className="btn-danger sm" onClick={() => dispatch(deleteProject(proj.id))}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </SectionCard>
          )}

          {/* RESUME TAB */}
          {activeTab === "resume" && (
            <SectionCard title="Resume">
              <p className="upload-hint">Upload your PDF — AI will auto-fill your entire profile</p>

              <div className="upload-row">
                <input type="file" accept=".pdf" onChange={e => setResumeFile(e.target.files[0])} />
                <button className="btn-primary" onClick={handleResumeUpload} disabled={resumeLoading}>
                  {resumeLoading ? "Uploading..." : "Upload & Parse"}
                </button>
              </div>

              {resumeMsg && (
                <p className={resumeMsg.includes("success") ? "success-msg" : "error-msg"}>
                  {resumeMsg}
                </p>
              )}

              {profile?.resume_url && (
                <a href={profile.resume_url} target="_blank" rel="noreferrer" className="resume-link">
                  📄 View Current Resume
                </a>
              )}

              {/* parsed preview after upload */}
              {parsed && (
                <div className="parsed-preview">
                  <h4>AI Parsed Data Preview</h4>
                  <div className="parsed-section">
                    <p className="parsed-label">Skills extracted</p>
                    <div className="skills-wrap">
                      {parsed.skills?.map(s => (
                        <span key={s} className="skill-chip readonly"><span>{s}</span></span>
                      ))}
                    </div>
                  </div>
                  <div className="parsed-section">
                    <p className="parsed-label">Experiences extracted ({parsed.experiences?.length})</p>
                    {parsed.experiences?.map((e, i) => (
                      <p key={i} className="parsed-item-line">• {e.role} at {e.company}</p>
                    ))}
                  </div>
                  <div className="parsed-section">
                    <p className="parsed-label">Projects extracted ({parsed.projects?.length})</p>
                    {parsed.projects?.map((p, i) => (
                      <p key={i} className="parsed-item-line">• {p.title}</p>
                    ))}
                  </div>
                  <p className="success-msg">✅ Profile has been updated with parsed data. Switch tabs to review.</p>
                </div>
              )}
            </SectionCard>
          )}

        </main>
      </div>
    </>
  );
}

export default ProfilePage;