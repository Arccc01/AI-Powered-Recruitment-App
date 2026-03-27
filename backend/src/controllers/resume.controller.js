const pdfParse = require("pdf-parse");
const { supabaseAdmin } = require("../services/supabase.service");
const { parseResume, calculateMatchScore } = require("../services/ai.service");


async function uploadResume(req, res, next) {
  try {
    // check file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file.",
      });
    }

    // step 1 — upload PDF to Supabase storage
    const fileName = `${req.user.id}_${Date.now()}.pdf`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("resumes")
      .upload(fileName, req.file.buffer, {
        contentType: "application/pdf",
        upsert: true,  // overwrite old resume
      });

    if (uploadError) {
      console.log("Storage upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload resume file.",
      });
    }

    // step 2 — get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("resumes")
      .getPublicUrl(fileName);

    const resumeUrl = urlData.publicUrl;

    // step 3 — extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from PDF. Make sure it is not a scanned image.",
      });
    }

    // step 4 — send to Gemini for parsing
    const parsed = await parseResume(resumeText);
    console.log("parsed data is:",parsed)

    // step 5 — get profile id
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    // step 6 — update profile with parsed data
    await supabaseAdmin
      .from("profiles")
      .update({
        full_name:    parsed.full_name  || null,
        phone:        parsed.phone      || null,
        city:         parsed.city       || null,
        headline:     parsed.headline   || null,
        summary:      parsed.summary    || null,
        resume_url:   resumeUrl,
        completion_percent: 70,
        last_saved_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    // step 7 — replace skills
    if (parsed.skills && parsed.skills.length > 0) {
      // delete old
      await supabaseAdmin
        .from("skills")
        .delete()
        .eq("profile_id", profile.id);

      // insert new
      const skillRows = parsed.skills.map((skill) => ({
        profile_id: profile.id,
        name: skill,
      }));
      await supabaseAdmin.from("skills").insert(skillRows);
    }

    // step 8 — replace experiences
    if (parsed.experiences && parsed.experiences.length > 0) {
      await supabaseAdmin
        .from("experiences")
        .delete()
        .eq("profile_id", profile.id);

      const expRows = parsed.experiences.map((exp) => ({
        profile_id:  profile.id,
        company:     exp.company     || null,
        role:        exp.role        || null,
        start_date:  exp.start_date  || null,
        end_date:    exp.end_date    || null,
        is_current:  exp.is_current  || false,
        description: exp.description || null,
      }));
      await supabaseAdmin.from("experiences").insert(expRows);
    }

    // step 9 — replace projects
    if (parsed.projects && parsed.projects.length > 0) {
      await supabaseAdmin
        .from("projects")
        .delete()
        .eq("profile_id", profile.id);

      const projectRows = parsed.projects.map((proj) => ({
        profile_id:  profile.id,
        title:       proj.title       || null,
        description: proj.description || null,
        tech_stack:  proj.tech_stack  || [],
      }));
      await supabaseAdmin.from("projects").insert(projectRows);
    }

    res.status(200).json({
      success: true,
      message: "Resume uploaded and parsed successfully!",
      data: {
        resume_url: resumeUrl,
        parsed,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── 2. GET MATCH SCORE ──────────────────────────────────────────────────────
// GET /api/resume/match/:jobId
async function getMatchScore(req, res, next) {
  try {
    // get candidate profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, city, headline")
      .eq("user_id", req.user.id)
      .single();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please complete your profile first.",
      });
    }

    // get skills
    const { data: skills } = await supabaseAdmin
      .from("skills")
      .select("name")
      .eq("profile_id", profile.id);

    // get experiences
    const { data: experiences } = await supabaseAdmin
      .from("experiences")
      .select("role, company, description")
      .eq("profile_id", profile.id);

    // get job details
    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("id, title, description, skills_required, location, job_type")
      .eq("id", req.params.jobId)
      .single();

    if (jobError || !job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // build candidate object for AI
    const candidateProfile = {
      headline:    profile.headline,
      city:        profile.city,
      skills:      skills?.map((s) => s.name) || [],
      experiences: experiences || [],
    };

    // get AI match score
    const matchResult = await calculateMatchScore(candidateProfile, job);

    // save score to applications table if candidate already applied
    await supabaseAdmin
      .from("applications")
      .update({ ai_match_score: matchResult.match_score })
      .eq("job_id", job.id)
      .eq("candidate_id", req.user.id);

    res.status(200).json({
      success: true,
      data: {
        job_title: job.title,
        ...matchResult,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── 3. GET MY RESUME URL ────────────────────────────────────────────────────
// GET /api/resume
async function getResume(req, res, next) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("resume_url, full_name, headline, completion_percent")
      .eq("user_id", req.user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    if (!profile.resume_url) {
      return res.status(404).json({
        success: false,
        message: "No resume uploaded yet.",
      });
    }

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadResume,
  getMatchScore,
  getResume,
};