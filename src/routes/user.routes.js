const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { validateToken } = require("../controllers/auth.controller");

router.post("/api/user", userController.validateUser, userController.addUser);

router.put(
  "/api/user/:userId",
  validateToken,
  userController.userFinderAlt,
  userController.validateUser,
  userController.editUser
);

router.get("/api/user/profile", validateToken, userController.getProfile);

router.get(
  "/api/user/:userId",
  validateToken,
  userController.userFinder,
  userController.getUserById
);

router.delete(
  "/api/user/:userId",
  validateToken,
  userController.userFinderAlt,
  userController.checkAuthority,
  userController.deleteUser
);

router.get("/api/user", userController.getAllUsers);

module.exports = router;
