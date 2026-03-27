const express = require("express");
const router = express.Router();
const { authenticate, candidateOnly } = require("../middleware/auth");
const upload = require("../middleware/upload.middleware");
const { uploadResume, getMatchScore, getResume } = require("../controllers/resume.controller");

// all routes require login + candidate
router.use(authenticate, candidateOnly);

router.post("/upload",        upload.single("resume"), uploadResume);  // upload + parse
router.get("/",               getResume);                              // get resume url
router.get("/match/:jobId",   getMatchScore);                          // match score

module.exports = router;