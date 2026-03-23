const express = require("express");
const router = express.Router();
const { authenticate, candidateOnly } = require("../middleware/auth");

const {
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
} = require("../controllers/profile.controller");

//Public route - no auth needed 
router.get("/share/:token", getPublicProfile);

// All routes below require login + candidate role
router.use(authenticate, candidateOnly);

// Profile
router.get("/me", getMyProfile);
router.put("/update", updateProfile);
router.post("/autosave", autosave);
router.get("/completion", getCompletion);
router.get("/last-saved", getLastSaved);

// Experience
router.post("/experience", addExperience);
router.put("/experience/:id", updateExperience);
router.delete("/experience/:id", deleteExperience);

// Skills
router.post("/skill", addSkill);
router.delete("/skill/:id", deleteSkill);

// Projects
router.post("/project", addProject);
router.put("/project/:id", updateProject);
router.delete("/project/:id", deleteProject);

module.exports = router;