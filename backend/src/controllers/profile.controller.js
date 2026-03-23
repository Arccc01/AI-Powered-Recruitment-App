const { supabaseAdmin } = require("../services/supabase.service");
const Joi = require("joi");

//schema for validation
const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().max(15).optional(),
  city: Joi.string().max(100).optional(),
  summary: Joi.string().max(1000).optional(),
  role: Joi.string().max(100).optional(),
  is_published: Joi.boolean().optional(),
});

const experienceSchema = Joi.object({
  company: Joi.string().required(),
  role: Joi.string().required(),
  duration: Joi.string().required(),
  description: Joi.string().required(),
  ai_structured: Joi.object().optional(),
});

const skillSchema = Joi.object({
  skill_name: Joi.string().required(),
  level: Joi.string().valid("beginner", "intermediate", "advanced", "expert").required(),
  ai_suggested: Joi.boolean().default(false),
});

const projectSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  tech_stack: Joi.array().items(Joi.string()).optional(),
  link: Joi.string().uri().optional().allow(""),
  ai_structured: Joi.object().optional(),
});


// Checks how many sections are filled and returns a percentage
const calculateCompletion = (profile, experiences, skills, projects) => {
  let score = 0;
  const total = 5; // 5 sections total

  if (profile.full_name && profile.email) score++;           // basic info
  if (profile.summary) score++;                               // summary
  if (experiences && experiences.length > 0) score++;        // experience
  if (skills && skills.length > 0) score++;                  // skills
  if (projects && projects.length > 0) score++;              // projects

  return Math.round((score / total) * 100);
};

// Get my Profile

const getMyProfile = async (req, res, next) => {
  try {
    //get profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    //get experience
    const { data: experiences } = await supabaseAdmin
      .from("experiences")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    // Get skills
    const { data: skills } = await supabaseAdmin
      .from("skills")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: true });

    // Get projects
    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    res.status(200).json({
      success: true,
      data: {
        profile,
        experiences: experiences || [],
        skills: skills || [],
        projects: projects || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// Update my Profile

const updateProfile = async (req, res, next) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Get profile id first
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        ...value,
        last_saved_at: new Date().toISOString(),
      })
      .eq("id", profile.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { profile: updatedProfile },
    });
  } catch (err) {
    next(err);
  }
};

// AutoSave

const autosave = async (req, res, next) => {
  try {
    // Get profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    // Only update fields that were sent — ignore the rest
    const allowedFields = ["full_name", "phone", "city", "summary", "role"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Always update last_saved_at
    updateData.last_saved_at = new Date().toISOString();

    await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", profile.id);

    // Return formatted time for UI — "Last saved at 2:30 PM"
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    res.status(200).json({
      success: true,
      message: "Draft saved.",
      data: {
        last_saved_at: now.toISOString(),
        last_saved_display: `Last saved at ${timeString}`,
      },
    });
  } catch (err) {
    next(err);
  }
};

//get completion

const getCompletion = async (req, res, next) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const { data: experiences } = await supabaseAdmin
      .from("experiences")
      .select("id")
      .eq("profile_id", profile.id);

    const { data: skills } = await supabaseAdmin
      .from("skills")
      .select("id")
      .eq("profile_id", profile.id);

    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("profile_id", profile.id);

    const percent = calculateCompletion(profile, experiences, skills, projects);

    // Update completion_percent in DB
    await supabaseAdmin
      .from("profiles")
      .update({ completion_percent: percent })
      .eq("id", profile.id);

    // Section-wise status for frontend progress UI
    const sections = {
      basic_info: !!(profile.full_name && profile.email),
      summary: !!profile.summary,
      experience: experiences && experiences.length > 0,
      skills: skills && skills.length > 0,
      projects: projects && projects.length > 0,
    };

    res.status(200).json({
      success: true,
      data: {
        completion_percent: percent,
        sections,
      },
    });
  } catch (err) {
    next(err);
  }
};

// last saved

const getLastSaved = async (req, res, next) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("last_saved_at")
      .eq("user_id", req.user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const lastSaved = new Date(profile.last_saved_at);
    const timeString = lastSaved.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    res.status(200).json({
      success: true,
      data: {
        last_saved_at: profile.last_saved_at,
        last_saved_display: `Last saved at ${timeString}`,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Add experience

const addExperience = async (req, res, next) => {
  try {
    const { error, value } = experienceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const { data: experience, error: insertError } = await supabaseAdmin
      .from("experiences")
      .insert({ profile_id: profile.id, ...value })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({
      success: true,
      message: "Experience added successfully.",
      data: { experience },
    });
  } catch (err) {
    next(err);
  }
};

// Delete Experience

const deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    // Make sure this experience belongs to this user
    const { data: experience } = await supabaseAdmin
      .from("experiences")
      .select("id")
      .eq("id", id)
      .eq("profile_id", profile.id)
      .single();

    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found." });
    }

    await supabaseAdmin.from("experiences").delete().eq("id", id);

    res.status(200).json({ success: true, message: "Experience deleted." });
  } catch (err) {
    next(err);
  }
};

// ─── Add Skill

const addSkill = async (req, res, next) => {
  try {
    const { error, value } = skillSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    // Check if skill already exists for this profile
    const { data: existingSkill } = await supabaseAdmin
      .from("skills")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("skill_name", value.skill_name)
      .single();

    if (existingSkill) {
      return res.status(409).json({ success: false, message: "Skill already added." });
    }

    const { data: skill, error: insertError } = await supabaseAdmin
      .from("skills")
      .insert({ profile_id: profile.id, ...value })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({
      success: true,
      message: "Skill added successfully.",
      data: { skill },
    });
  } catch (err) {
    next(err);
  }
};

// Delete Skill

const deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    const { data: skill } = await supabaseAdmin
      .from("skills")
      .select("id")
      .eq("id", id)
      .eq("profile_id", profile.id)
      .single();

    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found." });
    }

    await supabaseAdmin.from("skills").delete().eq("id", id);

    res.status(200).json({ success: true, message: "Skill deleted." });
  } catch (err) {
    next(err);
  }
};

// Add Project

const addProject = async (req, res, next) => {
  try {
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const { data: project, error: insertError } = await supabaseAdmin
      .from("projects")
      .insert({ profile_id: profile.id, ...value })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({
      success: true,
      message: "Project added successfully.",
      data: { project },
    });
  } catch (err) {
    next(err);
  }
};

// Delete project

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    const { data: project } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("profile_id", profile.id)
      .single();

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    await supabaseAdmin.from("projects").delete().eq("id", id);

    res.status(200).json({ success: true, message: "Project deleted." });
  } catch (err) {
    next(err);
  }
};


// Update Experience

const updateExperience = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updateExperienceSchema = Joi.object({
      company: Joi.string().optional(),
      role: Joi.string().optional(),
      duration: Joi.string().optional(),
      description: Joi.string().optional(),
      ai_structured: Joi.object().optional(),
    });

    const { error, value } = updateExperienceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const { data: existing } = await supabaseAdmin
      .from("experiences")
      .select("id")
      .eq("id", id)
      .eq("profile_id", profile.id)
      .single();

    if (!existing) {
      return res.status(404).json({ success: false, message: "Experience not found." });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("experiences")
      .update(value)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: "Experience updated successfully.",
      data: { experience: updated },
    });
  } catch (err) {
    next(err);
  }
};

// Update Project

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updateProjectSchema = Joi.object({
      title: Joi.string().optional(),
      description: Joi.string().optional(),
      tech_stack: Joi.array().items(Joi.string()).optional(),
      link: Joi.string().uri().optional().allow(""),
      ai_structured: Joi.object().optional(),
    });

    const { error, value } = updateProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const { data: existing } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("profile_id", profile.id)
      .single();

    if (!existing) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("projects")
      .update(value)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: { project: updated },
    });
  } catch (err) {
    next(err);
  }
};

//Get public profile by shared token

const getPublicProfile = async (req, res, next) => {
  try {
    const { token } = req.params;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("share_token", token)
      .eq("is_published", true)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found or not publicly available.",
      });
    }

    const { data: experiences } = await supabaseAdmin
      .from("experiences")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    const { data: skills } = await supabaseAdmin
      .from("skills")
      .select("*")
      .eq("profile_id", profile.id);

    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    // Only return safe public fields
    const publicProfile = {
      full_name: profile.full_name,
      city: profile.city,
      summary: profile.summary,
      role: profile.role,
      completion_percent: profile.completion_percent,
    };

    res.status(200).json({
      success: true,
      data: {
        profile: publicProfile,
        experiences: experiences || [],
        skills: skills || [],
        projects: projects || [],
      },
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getMyProfile,
  updateProfile,
  autosave,
  getCompletion,
  getLastSaved,
  addExperience,
  updateExperience,
  deleteExperience,
  addSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  getPublicProfile,
};