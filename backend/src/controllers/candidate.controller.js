const Joi = require("joi");
const { supabaseAdmin } = require("../services/supabase.service");

// GET /api/candidate/jobs — browse all active jobs with filters
async function browseJobs(req, res, next) {
  try {
    const { location, job_type, search } = req.query;

    let query = supabaseAdmin
      .from("jobs")
      .select(`
        *,
        users_meta (
          full_name,
          email
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // optional filters
    if (location) {
      query = query.ilike("location", `%${location}%`); // case insensitive search
    }
    if (job_type) {
      query = query.eq("job_type", job_type);
    }
    if (search) {
      query = query.ilike("title", `%${search}%`); // search by job title
    }

    const { data: jobs, error } = await query;

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

// GET /api/candidate/jobs/:id — view single job detail
async function getJobDetail(req, res, next) {
  try {
    const { data: job, error } = await supabaseAdmin
      .from("jobs")
      .select(`
        *,
        users_meta (
          full_name,
          email
        )
      `)
      .eq("id", req.params.id)
      .eq("is_active", true)
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

// POST /api/candidate/jobs/:id/apply — apply to a job
async function applyToJob(req, res, next) {
  try {
    // check if job exists and is active
    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("id, title, is_active")
      .eq("id", req.params.id)
      .single();

    if (jobError || !job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    if (!job.is_active) {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications.",
      });
    }

    // check if already applied
    const { data: existingApplication } = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("job_id", req.params.id)
      .eq("candidate_id", req.user.id)
      .single();

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job.",
      });
    }

    // create application
    const { data: application, error: applyError } = await supabaseAdmin
      .from("applications")
      .insert({
        job_id: req.params.id,
        candidate_id: req.user.id,
        status: "applied",
      })
      .select()
      .single();

    if (applyError) {
      console.log("applyError:", applyError);
      return res.status(500).json({
        success: false,
        message: "Failed to apply. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully applied to ${job.title}!`,
      data: { application },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/candidate/applications — see all my applications
async function getMyApplications(req, res, next) {
  try {
    const { data: applications, error } = await supabaseAdmin
      .from("applications")
      .select(`
        *,
        jobs (
          title,
          location,
          job_type,
          salary_min,
          salary_max,
          users_meta (
            full_name
          )
        )
      `)
      .eq("candidate_id", req.user.id)
      .order("applied_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch applications.",
      });
    }

    res.status(200).json({
      success: true,
      data: { applications },
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/candidate/applications/:id — withdraw application
async function withdrawApplication(req, res, next) {
  try {
    // check if application belongs to this candidate
    const { data: application } = await supabaseAdmin
      .from("applications")
      .select("id, status")
      .eq("id", req.params.id)
      .eq("candidate_id", req.user.id)
      .single();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    // cant withdraw if already shortlisted or hired
    if (["shortlisted", "hired"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw — application is already ${application.status}.`,
      });
    }

    await supabaseAdmin
      .from("applications")
      .delete()
      .eq("id", req.params.id)
      .eq("candidate_id", req.user.id);

    res.status(200).json({
      success: true,
      message: "Application withdrawn successfully.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  browseJobs,
  getJobDetail,
  applyToJob,
  getMyApplications,
  withdrawApplication,
};