const express = require("express");
const { userFinder } = require("../controllers/user.controller");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

router.post("/api/user", userController.validateUser, userController.addUser);

router.put(
  "/api/user/:userId",
  authController.validateToken,
  userController.userFinder,
  userController.validateUser,
  userController.editUser
);

router.get("/api/user/profile", userController.getProfile);

router.get(
  "/api/user/:userId",
  authController.validateToken,
  userController.userFinder,
  userController.getUserById
);

router.delete(
  "/api/user/:userId",
  authController.validateToken,
  userController.userFinder,
  userController.deleteUser
);

router.get("/api/user", userController.getAllUsers);

module.exports = router;
