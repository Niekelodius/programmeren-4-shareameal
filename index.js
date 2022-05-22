require("dotenv").config();
const express = require("express");
const app = express();

const port = process.env.PORT;
const router = require("./src/routes/user.routes");
const mealRouter = require("./src/routes/meal.routes");
const authRouter = require("./src/routes/auth.routes");
const bodyParser = require("body-parser");
const req = require("express/lib/request");
const logger = require("./src/config/config").logger;

app.use(bodyParser.json());
app.use(mealRouter);
app.use(router);
app.use(authRouter);

app.all("*", (req, res, next) => {
  const method = req.method;
  logger.log(`Method ${method} is aangeroepen op URL:${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

app.all("*", (req, res) => {
  res.status(404).json({
    status: 404,
    result: "End-point not found",
  });
});

//error handler
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status).json(err);
});

app.listen(port, () => {
  logger.log(`Example app listening on port ${port}`);
});

module.exports = app;
