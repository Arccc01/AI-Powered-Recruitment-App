const express = require("express");
const router = express.Router();
const { authenticate, recruiterOnly } = require("../middleware/auth");
const {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getApplicants,
  updateApplicationStatus
} = require("../controllers/job.controller");

// all routes below require login + recruiter role
router.use(authenticate, recruiterOnly);

router.post("/jobs", createJob);          // post a job
router.get("/jobs", getMyJobs);           // get my jobs
router.get("/jobs/:id", getJobById);      // get single job
router.put("/jobs/:id", updateJob);       // update a job
router.delete("/jobs/:id", deleteJob);    // delete a job
router.get("/jobs/:id/applicants", getApplicants);// see applicants
router.put("/applications/:id/status", updateApplicationStatus);

module.exports = router;