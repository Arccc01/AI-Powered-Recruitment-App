const express = require('express')
const router = express.Router()
const { signup, login, profile, logout } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authenticate, profile);
router.post("/logout", authenticate, logout);

module.exports = router