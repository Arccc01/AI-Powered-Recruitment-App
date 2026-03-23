const express = require('express')
const router = express.Router()
const { signup, login, getme, logout } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authenticate, getme);
router.post("/logout", authenticate, logout);

module.exports = router