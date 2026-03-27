# 🤖 HireME — AI-Powered Recruitment Platform

A full stack recruitment platform that uses **Gemini AI** to parse resumes, match candidates to jobs, suggest skills, and generate professional summaries.

---

## 📸 Features

### Candidate
- 📄 Upload PDF resume — AI auto-fills your entire profile
- 🎯 Get AI match score for any job (0–100%)
- 🔍 Browse and filter jobs by title, location, and type
- 📋 Track all applications and their statuses
- 🧠 AI skill suggestions based on your role
- ✍️ AI-generated professional summary and headline
- 💼 Manage experience, skills, and projects manually
- 💾 Autosave while editing profile

### Recruiter
- 📝 Post, edit, and delete job listings
- 👥 View all applicants per job
- 🤖 See AI match scores for each applicant
- ✅ Shortlist, hire, or reject candidates
- 📊 Dashboard with job and applicant stats

### AI Features (Gemini)
- Resume parsing — extract skills, experience, projects from PDF
- Job match scoring — compare candidate profile vs job requirements
- Skill suggestions — recommend skills based on role
- Summary generation — create professional bio from profile data
- Role recommendations — suggest suitable job titles
- Experience structuring — convert freeform text to structured JSON
- Project structuring — convert freeform text to structured JSON

---

## 🛠️ Tech Stack

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| Supabase (PostgreSQL) | Database |
| Supabase Storage | Resume file storage |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Joi | Request validation |
| Gemini AI API | All AI features |
| Multer | File upload handling |
| pdf-parse | Extract text from PDF |
| Helmet | HTTP security headers |
| Morgan | Request logging |
| express-rate-limit | Rate limiting |

### Frontend
| Tech | Purpose |
|------|---------|
| React + Vite | UI framework |
| Redux Toolkit | State management |
| React Router DOM | Client-side routing |
| Axios | API calls + interceptors |
| Plain CSS | Styling |

---

## 📁 Project Structure

```
root/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── profile.controller.js
│   │   │   ├── job.controller.js
│   │   │   ├── candidate.controller.js
│   │   │   ├── ai.controller.js
│   │   │   └── resume.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── profile.routes.js
│   │   │   ├── recruiter.routes.js
│   │   │   ├── candidate.routes.js
│   │   │   ├── ai.routes.js
│   │   │   └── resume.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.js
            ├── errorHandler.js
│   │   │   └── upload.middleware.js
│   │   └── services/
│   │       ├── supabase.service.js
│   │       └── ai.service.js
│   ├── .env
│   ├── .env.example
│   └── index.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js
    │   │   └── profile.api.js
    │   ├── app/
    │   │   └── store.js
    │   ├── features/
    │   │   ├── authSlice.js
    │   │   ├── jobsSlice.js
    │   │   ├── resumeSlice.js
    │   │   └── profileSlice.js
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── candidate/
    │   │   │   ├── DashboardPage.jsx
    │   │   │   ├── JobsPage.jsx
    │   │   │   ├── JobDetailPage.jsx
    │   │   │   ├── ApplicationsPage.jsx
    │   │   │   └── ProfilePage.jsx
    │   │   └── recruiter/
    │   │       ├── DashboardPage.jsx
    │   │       ├── PostJobPage.jsx
    │   │       ├── MyJobsPage.jsx
    │   │       └── ApplicantsPage.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Loader.jsx
    │   ├── styles/
    │   │   └── global.css
    │   ├── App.jsx
    │   └── main.jsx
    └── index.html
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Supabase account
- Google Gemini API key

---

### 1. Clone the repository

```bash
git clone https://github.com/Arccc01/AI-Powered-Recruitment-App.git
cd AI-Powered-Recruitment-App
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### 4. Supabase Setup

#### Create these tables in Supabase SQL Editor:

```sql
-- Users meta table
CREATE TABLE user_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('candidate', 'recruiter')),
  city TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_meta(id),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  headline TEXT,
  summary TEXT,
  resume_url TEXT,
  completion_percent INT DEFAULT 0,
  last_saved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Skills table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL
);

-- Experiences table
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  company TEXT,
  role TEXT,
  start_date TEXT,
  end_date TEXT,
  is_current BOOLEAN DEFAULT false,
  description TEXT
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  title TEXT,
  description TEXT,
  tech_stack TEXT[]
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES user_meta(id),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'remote', 'internship')),
  skills_required TEXT[],
  salary_min INT,
  salary_max INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  candidate_id UUID REFERENCES user_meta(id),
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'rejected', 'hired')),
  ai_match_score FLOAT,
  applied_at TIMESTAMP DEFAULT now()
);
```

#### Create Storage Bucket:
```
Supabase Dashboard → Storage → New Bucket
Name   : resumes
Public : true
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/profile` | Get logged in user | ✅ |
| POST | `/api/auth/logout` | Logout | ✅ |

### Profile (Candidate only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/me` | Full profile |
| PUT | `/api/profile/update` | Update profile |
| POST | `/api/profile/autosave` | Autosave |
| GET | `/api/profile/completion` | Completion % |
| POST | `/api/profile/experience` | Add experience |
| PUT | `/api/profile/experience/:id` | Update experience |
| DELETE | `/api/profile/experience/:id` | Delete experience |
| POST | `/api/profile/skill` | Add skill |
| DELETE | `/api/profile/skill/:id` | Delete skill |
| POST | `/api/profile/project` | Add project |
| PUT | `/api/profile/project/:id` | Update project |
| DELETE | `/api/profile/project/:id` | Delete project |
| GET | `/api/profile/share/:token` | Public profile |

### Jobs — Recruiter
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recruiter/jobs` | Post a job |
| GET | `/api/recruiter/jobs` | My posted jobs |
| PUT | `/api/recruiter/jobs/:id` | Update job |
| DELETE | `/api/recruiter/jobs/:id` | Delete job |
| GET | `/api/recruiter/jobs/:id/applicants` | View applicants |
| GET | `/api/recruiter/jobs/:id/ranked` | AI ranked applicants |
| PUT | `/api/recruiter/applications/:id/status` | Update status |

### Jobs — Candidate
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/candidate/jobs` | Browse jobs |
| GET | `/api/candidate/jobs/:id` | Job detail |
| POST | `/api/candidate/jobs/:id/apply` | Apply to job |
| GET | `/api/candidate/applications` | My applications |
| DELETE | `/api/candidate/applications/:id` | Withdraw |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/structure-experience` | Structure experience text |
| POST | `/api/ai/suggest-skills` | Suggest skills for role |
| POST | `/api/ai/generate-summary` | Generate profile summary |
| GET | `/api/ai/recommend-roles` | Recommend job roles |
| POST | `/api/ai/structure-project` | Structure project text |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload + AI parse PDF |
| GET | `/api/resume` | Get resume URL |
| GET | `/api/resume/match/:jobId` | AI match score |

---

## 🔐 Environment Variables

### Backend `.env`

```env
PORT=3000
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
GEMINI_API_KEY=
```

### Getting your keys

| Key | Where to get |
|-----|-------------|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role key |
| `JWT_SECRET` | Any random long string |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |

---

## 🗂️ .gitignore

Make sure your `.gitignore` includes:

```
node_modules/
.env
dist/
.DS_Store
```

---

## 📌 Upcoming Features

- [ ] Email notifications when application status changes
- [ ] Public shareable profile link
- [ ] AI interview question generator
- [ ] Mobile responsive design
- [ ] Toast notifications
- [ ] Job bookmarking

---

## 👨‍💻 Author

**Anuj** — Built with using Node.js, React, Supabase and Gemini AI

---

## 📄 License

This project is licensed under the MIT License.