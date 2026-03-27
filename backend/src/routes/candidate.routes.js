const express = require("express");
const router = express.Router();
const {
  authenticate,
  candidateOnly,
} = require("../middleware/auth");
const {
  browseJobs,
  getJobDetail,
  applyToJob,
  getMyApplications,
  withdrawApplication,
} = require("../controllers/candidate.controller");

// all routes require login + candidate role
router.use(authenticate, candidateOnly);

router.get("/jobs", browseJobs);                        // browse jobs
router.get("/jobs/:id", getJobDetail);                  // single job detail
router.post("/jobs/:id/apply", applyToJob);             // apply to job
router.get("/applications", getMyApplications);         // my applications
router.delete("/applications/:id", withdrawApplication); // withdraw application

module.exports = router;