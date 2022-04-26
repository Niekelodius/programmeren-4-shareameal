const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');


router.post("/api/user", userController.addUser);

router.put("/api/user/:userId", userController.editUser);

router.get("/api/user/profile", userController.getProfile);

router.get("/api/user/:userId", userController.getUserById);

router.delete("/api/user/:userId", userController.deleteUser);

router.get("/api/user", userController.getAllUsers);


module.exports = router;