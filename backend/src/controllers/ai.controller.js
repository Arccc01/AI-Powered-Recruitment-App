const { supabaseAdmin } = require("../services/supabase.service");
const {
  structureExperience,
  suggestSkills,
  generateSummary,
  recommendRoles,
  structureProject,
} = require("../services/ai.service");
const Joi = require("joi");

const structureExperienceHandler = async (req, res, next) => {
  try {
    const { error, value } = Joi.object({
      raw_text: Joi.string().min(10).max(2000).required(),
    }).validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const structured = await structureExperience(value.raw_text);

    res.status(200).json({
      success: true,
      message: "Experience structured successfully.",
      data: { structured },
    });
  } catch (err) {
    // Gemini API errors
    if (err.message?.includes("API_KEY")) {
      return res.status(500).json({
        success: false,
        message: "AI service configuration error.",
      });
    }
    next(err);
  }
};

const suggestSkillsHandler = async (req, res, next) => {
  try {
    const { error, value } = Joi.object({
      role: Joi.string().min(2).max(100).required(),
      existing_skills: Joi.array().items(Joi.string()).optional().default([]),
    }).validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const suggestions = await suggestSkills(value.role, value.existing_skills);

    res.status(200).json({
      success: true,
      message: "Skills suggested successfully.",
      data: { suggestions },
    });
  } catch (err) {
    next(err);
  }
};


const generateSummaryHandler = async (req, res, next) => {
  try {
    // Get candidate's full profile from DB
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const { data: skills } = await supabaseAdmin
      .from("skills")
      .select("*")
      .eq("profile_id", profile.id);

    const { data: experiences } = await supabaseAdmin
      .from("experiences")
      .select("*")
      .eq("profile_id", profile.id);

    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("profile_id", profile.id);

   
    const result = await generateSummary({
      full_name: profile.full_name,
      role: profile.role,
      city: profile.city,
      skills: skills || [],
      experiences: experiences || [],
      projects: projects || [],
    });

   
    await supabaseAdmin
      .from("profiles")
      .update({
        summary: result.summary,
        last_saved_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    res.status(200).json({
      success: true,
      message: "Summary generated and saved to profile.",
      data: { result },
    });
  } catch (err) {
    next(err);
  }
};


const recommendRolesHandler = async (req, res, next) => {
  try {
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

    const { data: skills } = await supabaseAdmin
      .from("skills")
      .select("*")
      .eq("profile_id", profile.id);

    const { data: experiences } = await supabaseAdmin
      .from("experiences")
      .select("*")
      .eq("profile_id", profile.id);

    const result = await recommendRoles(skills || [], experiences || []);

    res.status(200).json({
      success: true,
      message: "Role recommendations generated.",
      data: { result },
    });
  } catch (err) {
    next(err);
  }
};

const structureProjectHandler = async (req, res, next) => {
  try {
    const { error, value } = Joi.object({
      raw_text: Joi.string().min(10).max(2000).required(),
    }).validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const structured = await structureProject(value.raw_text);

    res.status(200).json({
      success: true,
      message: "Project structured successfully.",
      data: { structured },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  structureExperienceHandler,
  suggestSkillsHandler,
  generateSummaryHandler,
  recommendRolesHandler,
  structureProjectHandler,
};