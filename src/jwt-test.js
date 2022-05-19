const jwt = require("jsonwebtoken");

const privateKey = "secretString";

jwt.sign(
  { foo: "bar" },
  privateKey,
  function (err, token) {
    console.log(token);
  }
);
