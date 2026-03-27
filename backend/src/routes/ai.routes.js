const express = require("express");
const router = express.Router();
const { authenticate, candidateOnly } = require("../middleware/auth");
const {
  structureExperienceHandler,
  suggestSkillsHandler,
  generateSummaryHandler,
  recommendRolesHandler,
  structureProjectHandler,
} = require("../controllers/ai.controller");

router.use(authenticate, candidateOnly);

// AI endpoints
router.post("/structure-experience", structureExperienceHandler);
router.post("/suggest-skills", suggestSkillsHandler);
router.post("/generate-summary", generateSummaryHandler);
router.get("/recommend-roles", recommendRolesHandler);
router.post("/structure-project", structureProjectHandler);

module.exports = router;