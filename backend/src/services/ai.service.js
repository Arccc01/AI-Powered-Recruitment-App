require('dotenv').config()
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Always use gemini-1.5-flash — it's free and fast
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });


const parseGeminiJSON = (text) => {
  // Remove markdown code blocks if present
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
};

const askGemini = async (prompt) => {
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseGeminiJSON(text);
};

const structureExperience = async (rawText) => {
  const prompt = `
You are a professional resume assistant. A user has described their work experience in their own words.
Extract and structure this into a clean JSON object.

User input: "${rawText}"

Return ONLY a valid JSON object with these exact fields:
{
  "company": "company name or 'Not mentioned'",
  "role": "job title or best guess",
  "duration": "time period or 'Not mentioned'",
  "key_responsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
  "technologies": ["tech1", "tech2"],
  "impact": "one line describing the impact or achievement",
  "improved_description": "a professional 2-3 sentence description of this experience"
}

Rules:
- Do not add any explanation, only return the JSON
- If something is not mentioned, make a reasonable inference or use "Not mentioned"
- Keep language professional and concise
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseGeminiJSON(text);
};

const suggestSkills = async (role, existingSkills = []) => {
  const prompt = `
You are a tech hiring expert. Based on the job role and existing skills, suggest additional relevant skills.

Job Role: "${role}"
Existing Skills: ${existingSkills.length > 0 ? existingSkills.join(", ") : "None"}

Return ONLY a valid JSON object:
{
  "suggested_skills": [
    {
      "skill_name": "skill name",
      "level": "beginner or intermediate or advanced",
      "reason": "one line why this skill is relevant"
    }
  ]
}

Rules:
- Suggest exactly 6 skills
- Do not suggest skills already in the existing list
- Focus on skills that are in demand for this role in 2024
- Only return the JSON, no explanation
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseGeminiJSON(text);
};

const generateSummary = async (profileData) => {
  const { full_name, role, skills, experiences, projects, city } = profileData;

  const prompt = `
You are a professional resume writer. Generate a compelling profile summary for this candidate.

Candidate Details:
- Name: ${full_name || "Not provided"}
- Desired Role: ${role || "Software Developer"}
- Location: ${city || "Not provided"}
- Skills: ${skills && skills.length > 0 ? skills.map((s) => s.skill_name).join(", ") : "Not provided"}
- Experience: ${
    experiences && experiences.length > 0
      ? experiences.map((e) => `${e.role} at ${e.company}`).join(", ")
      : "Fresher"
  }
- Projects: ${
    projects && projects.length > 0
      ? projects.map((p) => p.title).join(", ")
      : "None mentioned"
  }

Return ONLY a valid JSON object:
{
  "summary": "A professional 3-4 sentence summary paragraph",
  "headline": "A short 10 word professional headline",
  "key_strengths": ["strength 1", "strength 2", "strength 3"]
}

Rules:
- Summary should be in first person
- Sound human and natural, not robotic
- Highlight the most impressive aspects
- Only return JSON, no explanation
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseGeminiJSON(text);
};

const recommendRoles = async (skills, experiences) => {
  const prompt = `
You are a career counselor. Based on the candidate's skills and experience, recommend suitable job roles.

Skills: ${skills && skills.length > 0 ? skills.map((s) => `${s.skill_name} (${s.level})`).join(", ") : "Not provided"}
Experience: ${
    experiences && experiences.length > 0
      ? experiences.map((e) => `${e.role} at ${e.company} for ${e.duration}`).join("; ")
      : "No experience yet (fresher)"
  }

Return ONLY a valid JSON object:
{
  "recommended_roles": [
    {
      "title": "Job Role Title",
      "match_percent": 85,
      "reason": "One line why this role fits",
      "required_skills_gap": ["skill they should learn"]
    }
  ]
}

Rules:
- Recommend exactly 5 roles
- match_percent should be between 50 and 95
- Be realistic and practical
- Only return JSON, no explanation
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseGeminiJSON(text);
};

// ─── 5. STRUCTURE PROJECT ────────────────────────────────────────────────────
// Takes raw project description → returns structured project JSON

const structureProject = async (rawText) => {
  const prompt = `
You are a professional resume assistant. A user has described their project in their own words.
Extract and structure this into a clean JSON object.

User input: "${rawText}"

Return ONLY a valid JSON object:
{
  "title": "project title",
  "improved_description": "professional 2-3 sentence project description",
  "tech_stack": ["tech1", "tech2", "tech3"],
  "key_features": ["feature 1", "feature 2", "feature 3"],
  "impact": "one line about the project's impact or what problem it solves"
}

Rules:
- Only return JSON, no explanation
- If tech stack is not mentioned, make reasonable inferences
- Keep language professional
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseGeminiJSON(text);
};

// ─── 6. PARSE RESUME ─────────────────────────────────────────────────────────
async function parseResume(resumeText) {
  const prompt = `
You are an expert resume parser.
Extract all information from this resume text and return ONLY valid JSON, no extra text, no markdown.

Resume Text:
"${resumeText}"

Return this exact structure:
{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "city": "string",
  "headline": "one line professional headline",
  "summary": "2-3 line professional summary",
  "skills": ["skill1", "skill2", "skill3"],
  "experiences": [
    {
      "company": "string",
      "role": "string",
      "start_date": "string",
      "end_date": "string or null if current",
      "is_current": true or false,
      "description": "string",
      "skills_used": ["skill1", "skill2"]
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "tech_stack": ["tech1", "tech2"],
      "highlights": ["highlight1", "highlight2"]
    }
  ]
}

Rules:
- Extract ALL experiences and projects from the resume
- If a field is not found, use null
- skills should be a flat array of strings
`;
  return await askGemini(prompt);
}

async function calculateMatchScore(candidateProfile, job) {
  const prompt = `
You are a recruitment AI assistant.
Compare this candidate profile with the job description and return a match score.
Return ONLY valid JSON, no extra text, no markdown.

Candidate Profile:
${JSON.stringify(candidateProfile)}

Job:
${JSON.stringify(job)}

Return this exact structure:
{
  "match_score": 85,
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "summary": "2-3 line summary of fit",
  "recommendation": "Strong fit" or "Good fit" or "Partial fit" or "Weak fit"
}

Rules:
- match_score is a number from 0 to 100
- Be honest and accurate
- matching_skills are skills candidate has that job needs
- missing_skills are skills job needs that candidate lacks
`;
  return await askGemini(prompt);
}

// add to exports
module.exports = {
  structureExperience,
  suggestSkills,
  generateSummary,
  recommendRoles,
  structureProject,
  parseResume,         
  calculateMatchScore,  
};
