const Joi = require("joi");
const { supabaseAdmin } = require("../services/supabase.service");

// Validation schema
const jobSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  location: Joi.string().max(100).optional(),
  job_type: Joi.string()
    .valid("full-time", "part-time", "remote", "internship")
    .required(),
  skills_required: Joi.array().items(Joi.string()).optional(),
  salary_min: Joi.number().optional(),
  salary_max: Joi.number().optional(),
});

// POST /api/recruiter/jobs — create a job
async function createJob(req, res, next) {
  try {
    const { error, value } = jobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { data: job, error: insertError } = await supabaseAdmin
      .from("jobs")
      .insert({
        ...value,
        recruiter_id: req.user.id,  // from authenticate middleware
      })
      .select()
      .single();

    if (insertError) {
      console.log("insertError:", insertError);
      return res.status(500).json({
        success: false,
        message: "Failed to create job.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Job posted successfully!",
      data: { job },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/jobs — get my posted jobs
async function getMyJobs(req, res, next) {
  try {
    const { data: jobs, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("recruiter_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch jobs.",
      });
    }

    res.status(200).json({
      success: true,
      data: { jobs },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/jobs/:id — get single job
async function getJobById(req, res, next) {
  try {
    const { data: job, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", req.params.id)
      .eq("recruiter_id", req.user.id)  // only your own job
      .single();

    if (error || !job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: { job },
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/recruiter/jobs/:id — update a job
async function updateJob(req, res, next) {
  try {
    const { error, value } = jobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { data: job, error: updateError } = await supabaseAdmin
      .from("jobs")
      .update(value)
      .eq("id", req.params.id)
      .eq("recruiter_id", req.user.id)  // can only update your own job
      .select()
      .single();

    if (updateError || !job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or update failed.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully!",
      data: { job },
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/recruiter/jobs/:id — delete a job
async function deleteJob(req, res, next) {
  try {
    const { error } = await supabaseAdmin
      .from("jobs")
      .delete()
      .eq("id", req.params.id)
      .eq("recruiter_id", req.user.id);  // can only delete your own job

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Job not found or delete failed.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully!",
    });
  } catch (err) {
    next(err);
  }
}

async function getApplicants(req, res, next) {
  try {
    const { data: applicants, error } = await supabaseAdmin
      .from("applications")
      .select(`
        *,
        users_meta (
          id,
          full_name,
          email
        ),
        profiles (
          city,
          phone,
          completion_percent
        )
      `)
      .eq("job_id", req.params.id)
      .order("applied_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch applicants.",
      });
    }

    res.status(200).json({
      success: true,
      data: { applicants },
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/recruiter/applications/:id — shortlist or reject
async function updateApplicationStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!["shortlisted", "rejected", "hired"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use shortlisted, rejected or hired.",
      });
    }

    const { data: application, error } = await supabaseAdmin
      .from("applications")
      .update({ status })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully!`,
      data: { application },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getApplicants,
  updateApplicationStatus
};