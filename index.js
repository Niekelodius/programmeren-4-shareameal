const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const router = require('./src/routes/user.routes');
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(router);


app.all("*", (req, res, next) => {
  const method = req.method;
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

//error handler
app.use((err, req, res, next) => {
  res.status(err.status).json(err)

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
