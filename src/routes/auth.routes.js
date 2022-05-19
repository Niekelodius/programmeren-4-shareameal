const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/auth/login", authController.validateLogin, authController.login);

module.exports = router;

// {
//     "firstName": "Niek",
//     "lastName": "Goossens",
//     "emailAdress": "ncag@gmail.com",
//     "password": "wachtwoord",
//     "isActive": 1,
//     "phoneNumber": "0123456789",
//     "roles": "editor",
//     "street": "achter",
//     "city": "dorp"
//   }

// {
//     "name": "Friet",
//     "description": "Friet met mayo",
//     "isActive": true,
//     "isVega": false,
//     "isVegan": true,
//     "isToTakeHome": true,
//     "maxAmountOfParticipants": 5,
//     "price": 5.99,
//     "dateTime": "2022-08-23",
//     "imageUrl": "https://imgur.com/a/0WO84",
//     "allergenes": "aardappel"

//   }
