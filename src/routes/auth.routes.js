const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/api/auth/login", authController.validateLogin, authController.login);

module.exports = router;
