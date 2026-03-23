# AI Recruitment Platform — Backend

Node.js + Express + Supabase + Gemini AI

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Runtime | Node.js | Fast, JS everywhere |
| Framework | Express | Lightweight, flexible |
| Database | Supabase (PostgreSQL) | Relational data, RLS, free tier |
| AI | Google Gemini API | Free tier, powerful |
| Auth | JWT (custom) | Full control over tokens |
| PDF | jspdf | Client-friendly PDF generation |

---

## Setup Instructions

### 1. Clone & Install

```bash
cd backend
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env`:
- `SUPABASE_URL` — from your Supabase project settings
- `SUPABASE_ANON_KEY` — from Supabase API settings
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase API settings (keep secret!)
- `JWT_SECRET` — any long random string
- `GEMINI_API_KEY` — from Google AI Studio (free)

### 3. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the contents of `supabase_schema.sql`

### 4. Seed Demo User

```bash
npm run seed
```

This creates:
- **Candidate:** hire-me@anshumat.org / HireMe@2025!
- **Recruiter:** recruiter@anshumat.org / HireMe@2025!

### 5. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/auth/me | ✅ | Get current user |
| POST | /api/auth/logout | ✅ | Logout |

### Profile (Day 2)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/profile/me | Get my profile |
| PUT | /api/profile/update | Update profile |
| POST | /api/profile/autosave | Autosave draft |
| GET | /api/profile/completion | Get completion % |

### AI (Day 3)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/structure-experience | Convert text → structured JSON |
| POST | /api/ai/suggest-skills | Get skill suggestions |
| POST | /api/ai/generate-summary | Generate profile bio |

### Recruiter (Day 4)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/recruiter/candidates | List all candidates |
| GET | /api/recruiter/candidate/:id | View single candidate |
| POST | /api/recruiter/shortlist/:id | Shortlist candidate |

### Export (Day 4)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/export/resume-pdf/:id | Download resume PDF |
| GET | /api/export/share-link/:id | Get shareable link |

---

## Health Check

```
GET http://localhost:5000/health
```